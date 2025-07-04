import { initOrm } from "db";
import { DocumentType } from "entities";

const db = await initOrm();

async function setInsurancePath() {
	const documents = await db.document.findAll({
		where: { documentType: DocumentType.insurance },
		populate: ["student.crefito"],
	});

	for (const document of documents) {
		document.destPath = document.student!.crefito;

		await db.em.persistAndFlush(document);
	}
}

setInsurancePath();
