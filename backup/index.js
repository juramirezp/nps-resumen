import fs from "fs";

const readLocalizationFile = () => {
	try {
		const data = fs.readFileSync("localization.json", "utf8");
		const localization = JSON.parse(data);
		console.log("Cantidad de registros: ", localization.Hoja1.length);

		const result = Object.groupBy(localization.Hoja1, ({ Carrera }) => Carrera);
		// console.log(result);
		for (let title in result) {
			console.log(title);
			let cantidadrespuestas = result[title].length;
			console.log("Cantidad de respuestas de la carrera: ", cantidadrespuestas);
			console.log("---");

			// Promotores
			let cantidadPromotores = result[title].filter((item) => item.nps == "Promotor").length;
			console.log("Cantidad de promotores: ", cantidadPromotores);
			let porcentajePromotores = (
				(100 * result[title].filter((item) => item.nps == "Promotor").length) /
				localization.Hoja1.length
			).toFixed(1);
			console.log("Porcentaje de promotores del total: ", porcentajePromotores);

			// Neutros
			let cantidadNeutros = result[title].filter((item) => item.nps == "Neutro").length;
			console.log("Cantidad de neutros: ", cantidadNeutros);
			let porcentajeNeutros = (
				(100 * result[title].filter((item) => item.nps == "Neutro").length) /
				localization.Hoja1.length
			).toFixed(1);
			console.log("Porcentaje de neutros del total: ", porcentajeNeutros);

			// Detractores
			let cantidadDetractores = result[title].filter((item) => item.nps == "Detractor").length;
			console.log("Cantidad de detractores: ", cantidadDetractores);
			let porcentajeDetractores = (
				(100 * result[title].filter((item) => item.nps == "Detractor").length) /
				localization.Hoja1.length
			).toFixed(1);
			console.log("Porcentaje de detractores del total: ", porcentajeDetractores);
			console.log("---");
			console.log("Resultado NPS: ", (parseFloat(porcentajePromotores) - parseFloat(porcentajeDetractores)).toFixed(1));

			// Separacion
			console.log("--------------------");
			console.log("");
			console.log("");
		}

		// Promotores
		let promotores = localization.Hoja1.filter((item) => item.nps == "Promotor");
		console.log("Promotores: ", promotores.length);

		// Neutros
		let neutros = localization.Hoja1.filter((item) => item.nps == "Neutro");
		console.log("Neutros: ", neutros.length);

		// Detractores
		let detractores = localization.Hoja1.filter((item) => item.nps == "Detractor");
		console.log("Detractores: ", detractores.length);
	} catch (error) {
		console.error("Error reading localization file:", error);
		return null;
	}
};

readLocalizationFile();
