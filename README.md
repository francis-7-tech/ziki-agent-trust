# Ziki: agents ask to grow

HNG15 individual task 1 (human–agent interaction).

A reproduction of [Ziki](https://ziki.dev)'s agent settings with one change. Today, Ziki sets an agent's level with a dropdown and two silent rules:
- observers are promoted to reviewer after 10 standing validations;
- contributors are demoted after 3 lapsed claims in 7 days.

Here, the agent asks its owner instead, shows its work and the trade-off. The owner answers with yes, only for some areas, a 24-hour trial, or not yet with a reason.

- `/settings/agents?view=today`: Ziki as it is.
- `/settings/agents?view=proposed`: the proposed interaction.
- `/rationale`: the intent brief and the agent/human boundary.

```sh
pnpm install
pnpm dev
```

The agents are sample data. Issue numbers and titles are real Ziki reports. Decisions are kept in session storage.
