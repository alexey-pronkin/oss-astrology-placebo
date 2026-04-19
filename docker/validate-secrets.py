from __future__ import annotations

import math
import os
import re
import sys
from collections import Counter
from pathlib import Path


APP_ROOT = Path(os.environ.get("APP_ROOT", "/app"))
MAX_SCAN_BYTES = 1024 * 1024
OPENROUTER_KEY_PREFIX = "-".join(("sk", "or", "v1")) + "-"

IGNORED_DIRS = {
    ".git",
    ".omx",
    "dist",
    "dist-ssr",
    "node_modules",
    "secrets",
}

IGNORED_FILES = {
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
}

SECRET_PATTERNS = [
    (
        "OpenRouter API key",
        re.compile(r"\b" + re.escape(OPENROUTER_KEY_PREFIX) + r"[-._A-Za-z0-9]{8,}\b"),
    ),
    ("GitHub token", re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{36,}\b")),
    ("AWS access key id", re.compile(r"\b(?:A3T[A-Z0-9]|AKIA|ASIA)[A-Z0-9]{16}\b")),
    ("Google API key", re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b")),
    (
        "Private key block",
        re.compile(r"-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----"),
    ),
]


class ValidationError(Exception):
    pass


def fail(message: str) -> None:
    raise ValidationError(message)


def is_placeholder(value: str) -> bool:
    normalized = value.strip()
    if not normalized:
        return True

    lowered = normalized.lower()
    return (
        lowered in {"change-me", "changeme", "example", "dummy", "test"}
        or lowered.startswith("replace-")
        or lowered.startswith("your-")
        or (normalized.startswith("<") and normalized.endswith(">"))
    )


def shannon_entropy_per_char(value: str) -> float:
    if not value:
        return 0.0

    total = len(value)
    counts = Counter(value)
    return -sum((count / total) * math.log2(count / total) for count in counts.values())


def has_symbol(value: str) -> bool:
    return any(not character.isalnum() for character in value)


def has_required_classes(value: str) -> bool:
    return (
        any(character.islower() for character in value)
        and any(character.isupper() for character in value)
        and any(character.isdigit() for character in value)
        and has_symbol(value)
    )


def assert_secret_quality(
    name: str,
    value: str,
    *,
    min_length: int,
    min_unique_chars: int,
    min_entropy: float,
    require_all_classes: bool,
) -> None:
    if is_placeholder(value):
        fail(f"{name} is missing or still a placeholder")

    if len(value) < min_length:
        fail(f"{name} must be at least {min_length} characters")

    if any(character.isspace() for character in value):
        fail(f"{name} must not contain whitespace")

    if len(set(value)) < min_unique_chars:
        fail(f"{name} does not contain enough unique characters")

    if len(set(value)) == 1:
        fail(f"{name} is not random enough")

    lowered = value.lower()
    if any(word in lowered for word in ("password", "secret", "token")):
        fail(f"{name} contains an obvious non-random word")

    if not has_symbol(value):
        fail(f"{name} must contain at least one symbol")

    if require_all_classes and not has_required_classes(value):
        fail(f"{name} must contain lowercase, uppercase, digit, and symbol classes")

    entropy = shannon_entropy_per_char(value)
    if entropy < min_entropy:
        fail(f"{name} entropy is too low ({entropy:.2f} bits per character)")


def read_secret_file(path_value: str) -> str:
    if not path_value:
        return ""

    path = Path(path_value)
    if not path.is_absolute():
        path = APP_ROOT / path

    if not path.is_file():
        return ""

    return path.read_text(encoding="utf-8").splitlines()[0].strip()


def validate_runtime_secrets() -> None:
    openrouter_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if is_placeholder(openrouter_key):
        openrouter_key = read_secret_file(os.environ.get("OPENROUTER_API_KEY_FILE", ""))

    if not openrouter_key.startswith(OPENROUTER_KEY_PREFIX):
        fail("OPENROUTER_API_KEY does not look like an OpenRouter v1 key")

    openrouter_random_body = openrouter_key.removeprefix(OPENROUTER_KEY_PREFIX)
    assert_secret_quality(
        "OPENROUTER_API_KEY",
        openrouter_key,
        min_length=48,
        min_unique_chars=12,
        min_entropy=3.0,
        require_all_classes=False,
    )
    assert_secret_quality(
        "OPENROUTER_API_KEY body",
        openrouter_random_body,
        min_length=32,
        min_unique_chars=10,
        min_entropy=3.2,
        require_all_classes=False,
    )

    assert_secret_quality(
        "CROWDSEC_BOUNCER_KEY",
        os.environ.get("CROWDSEC_BOUNCER_KEY", "").strip(),
        min_length=32,
        min_unique_chars=16,
        min_entropy=4.0,
        require_all_classes=True,
    )


def should_scan_file(path: Path) -> bool:
    relative_parts = path.relative_to(APP_ROOT).parts
    if any(part in IGNORED_DIRS for part in relative_parts):
        return False

    if path.name in IGNORED_FILES:
        return False

    if not path.is_file():
        return False

    if path.stat().st_size > MAX_SCAN_BYTES:
        return False

    return True


def scan_source_tree() -> None:
    findings: list[str] = []

    for path in APP_ROOT.rglob("*"):
        if not should_scan_file(path):
            continue

        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        relative_path = path.relative_to(APP_ROOT)
        for name, pattern in SECRET_PATTERNS:
            for match in pattern.finditer(content):
                line = content[: match.start()].count("\n") + 1
                findings.append(f"{relative_path}:{line} {name}")

    if findings:
        formatted_findings = "\n".join(f"- {finding}" for finding in findings)
        fail(f"tracked source contains token-like secrets:\n{formatted_findings}")


def main() -> int:
    try:
        print("Running source secret scan...")
        scan_source_tree()
        print("Validating runtime secret quality...")
        validate_runtime_secrets()
    except ValidationError as error:
        print(f"secrets validation failed: {error}", file=sys.stderr)
        return 1

    print("Secrets validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
