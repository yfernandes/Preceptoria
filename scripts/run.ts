#!/usr/bin/env bun
import { readdir } from "fs/promises";
import concurrently from "concurrently";

const [, , command] = process.argv;

const mapPrefix = (prefix: string) => (folders: string[]) =>
	folders.map((folder) => `${prefix}/${folder}`);

const folders = await Promise.all([
	readdir("apps").then(mapPrefix("apps")),
	readdir("packages").then(mapPrefix("packages")),
]).then((x) => x.reduce((x, y) => [...x, ...y], []));

const paths = await Promise.all(
	folders.map(async (path) => {
		const file = Bun.file(`${path}/package.json`);

		if (!(await file.exists())) return;

		const packageJson = await file.json();

		if (packageJson.scripts && command in packageJson.scripts) return path;
	})
).then((x) => x.filter((x) => x !== undefined));

const colors = ["blue", "green", "magenta", "yellow", "red"];

concurrently(
	paths.map((path, index) => ({
		name: path,
		command: `cd ${path} && bun run ${command}`,
		prefixColor: colors[index % colors.length],
	}))
).result.catch(() => {});
