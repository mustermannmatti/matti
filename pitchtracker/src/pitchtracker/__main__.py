"""Allow `python -m pitchtracker` — avoids PATH issues with the console script on Windows."""
from .cli import main

if __name__ == "__main__":
    raise SystemExit(main())
