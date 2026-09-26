---
title: "What is an AI agent, really? A student's guide"
description: "Chatbots answer. Agents act. Here's the simple loop behind AI agents, and what you need to learn to build one."
date: 2026-09-20
author: Feed My Brain
---

You've used chatbots. You type a question, you get an answer. An **AI agent** goes one step further: it can decide what to do next, use tools, and keep going until a task is done.

## The agent loop in one picture

Almost every AI agent, from a simple research bot to a voice assistant, runs the same loop:

1. **Think:** the language model reads the goal and what has happened so far.
2. **Act:** it picks a tool to use, such as searching the web, querying a database or calling an API.
3. **Observe:** it reads the tool's result.
4. **Repeat** until the goal is met, then answer.

That's it. The magic is in giving the model *good tools*, *useful memory* and *safe limits*.

## What you need to learn to build one

- **Python:** agents are ultimately Python calling APIs and reading or writing data.
- **SQL and databases:** real agents remember things and look up facts. PostgreSQL is everywhere.
- **LLM APIs and prompting:** structured outputs and tool (function) calling.
- **RAG:** letting a model answer from *your* documents with citations.
- **Frameworks and MCP:** to connect agents to tools and data sources cleanly.
- **Safety and evaluation:** human approval for risky actions, and tests that prove your agent works.

## Where students go wrong

Most people jump straight to a framework and get lost when something breaks. Building the agent loop **from scratch once** makes everything else click, which is exactly why our [Agentic AI Development](/courses/agentic-ai) course does it in Week 9, before introducing frameworks.

## Start building

If you can write basic Python, you can start building simple agents within weeks. If you can't yet, that's fine too. Our course starts from your very first Python script.
