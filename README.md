# popgarten

To install dependencies:

```bash
bun install
```

To run:

```bash
# Dry-run
bun pop.ts bkkjs22 --test

# For real
bun pop.ts bkkjs22
```

...or run with GitHub Actions:

```sh
gh workflow --repo creatorsgarten/popgarten run pop.yml -f slug=bkkjs22
```
