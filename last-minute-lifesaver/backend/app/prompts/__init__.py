import os

PROMPTS_DIR = os.path.dirname(os.path.abspath(__file__))


def load_prompt(filename: str) -> str:
    filepath = os.path.join(PROMPTS_DIR, filename)
    with open(filepath, "r") as f:
        return f.read().strip()


TASK_PLANNER_PROMPT = load_prompt("task_planner.txt")
PRIORITIZER_PROMPT = load_prompt("prioritizer.txt")
SCHEDULER_PROMPT = load_prompt("scheduler.txt")
CLARIFIER_PROMPT = load_prompt("clarifier.txt")

__all__ = [
    "TASK_PLANNER_PROMPT",
    "PRIORITIZER_PROMPT",
    "SCHEDULER_PROMPT",
    "CLARIFIER_PROMPT",
    "load_prompt",
]
