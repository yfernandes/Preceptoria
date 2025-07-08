import { treatise } from "./checkhealth";

(async () => {
	const health = await treatise.health.get();
	console.log(health);
})();
