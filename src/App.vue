<template>
	<!-- <div class="alert alert-warning" role="alert">
		<strong>NOTA IMPORTANTE:</strong>
		las columnas deben llamarse 'Carreras' y 'nps' respectivamente
	</div> -->
	<h2 class="mt-3">Adjuntar Archivo Excel</h2>
	<div class="mb-3 col-5 mx-auto">
		<input class="form-control" type="file" id="formFile" @change="onFileChange" />
	</div>
	<button type="button" class="btn btn-primary px-5 mt-2" @click="isGenerated = true" :disabled="isGenerated">
		Procesar
	</button>

	<button type="button" class="btn btn-success btn-exportar" @click="exportTableToExcel">Exportar</button>

	<table class="table table-bordered mt-5" v-if="isGenerated">
		<thead>
			<tr>
				<th>Total Respuestas</th>
				<th>Total Detractores</th>
				<th>Total Neutros</th>
				<th>Total Promotores</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>{{ dataGeneral.total }}</td>
				<td>{{ dataGeneral.detractores }}</td>
				<td>{{ dataGeneral.neutros }}</td>
				<td>{{ dataGeneral.promotores }}</td>
			</tr>
		</tbody>
	</table>

	<table class="table table-bordered mt-5" id="tabla-resumen" v-if="isGenerated">
		<thead>
			<tr>
				<th>Carrera</th>
				<th>Respuestas carrera</th>
				<th>Detractores Cant.</th>
				<th>Detractores %</th>
				<th>Neutros Cant.</th>
				<th>Neutros %</th>
				<th>Promotores Cant.</th>
				<th>Promotores %</th>
				<th>Resultado NPS</th>
				<th>Representatividad</th>
			</tr>
		</thead>
		<tbody>
			<tr v-for="item in dataResumenTabla" :key="item.Carrera">
				<td>{{ item.carrera }}</td>
				<td>{{ item.respuestasCarrera }}</td>
				<td>{{ item.cantDestractores }}</td>
				<td>{{ item.porcDetractores }}</td>
				<td>{{ item.cantNeutros }}</td>
				<td>{{ item.porcNeutros }}</td>
				<td>{{ item.cantPromotores }}</td>
				<td>{{ item.porcPromotores }}</td>
				<td :class="{ 'text-success': item.resultadoNps > 0, 'text-danger': item.resultadoNps < 0 }">
					<strong>{{ item.resultadoNps }}</strong>
				</td>
				<td>{{ item.representatividad }}</td>
			</tr>
		</tbody>
	</table>
</template>

<script setup>
import { ref } from "vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const clearData = () => {
	dataGeneral.value = {
		total: 0,
		detractores: 0,
		neutros: 0,
		promotores: 0,
	};
	dataResumenTabla.value = [];
	isGenerated.value = false;
};

const exportTableToExcel = () => {
	let table = document.getElementById("tabla-resumen");
	let wb = XLSX.utils.table_to_book(table, { sheet: "Sheet JS" });
	let wbout = XLSX.write(wb, { bookType: "xlsx", bookSST: true, type: "binary" });
	let buf = new ArrayBuffer(wbout.length);
	let view = new Uint8Array(buf);
	for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xff;
	saveAs(new Blob([buf], { type: "application/octet-stream" }), "resumenNps" + ".xlsx");
	isGenerated.value = true;
};

let selectedFile = ref(null);
const jsonResult = ref(null);
const dataGeneral = ref({
	total: 0,
	detractores: 0,
	neutros: 0,
	promotores: 0,
});
const dataResumenTabla = ref([]);
const isGenerated = ref(false);

const onFileChange = (e) => {
	clearData();
	selectedFile.value = e.target.files[0];
	let reader = new FileReader();
	reader.onload = function (event) {
		let data = new Uint8Array(event.target.result);
		let workbook = XLSX.read(data, { type: "array" });
		let firstSheetName = workbook.SheetNames[0];
		let worksheet = workbook.Sheets[firstSheetName];
		let jsonData = XLSX.utils.sheet_to_json(worksheet, {
			header: ["Carrera", "nps"],
			range: "A2:B10000",
			blankRows: false,
		});
		// let jsonData = XLSX.utils.sheet_to_json(worksheet);
		// let jsonData = XLSX.utils.sheet_to_json(worksheet, { header: "1" });
		console.log(jsonData);
		jsonResult.value = jsonData;
		procesarData(jsonResult.value);
	};
	reader.readAsArrayBuffer(selectedFile.value);
};

const procesarData = (localization) => {
	console.log("Cantidad de registros: ", localization.length);
	dataGeneral.value.total = localization.length;

	const result = Object.groupBy(localization, ({ Carrera }) => Carrera);
	console.log(result);
	for (let title in result) {
		let dataResumen = {
			carrera: "",
			respuestasCarrera: 0,
			cantPromotores: 0,
			porcPromotores: 0,
			cantNeutros: 0,
			porcNeutros: 0,
			cantDestractores: 0,
			porcDetractores: 0,
			resultadoNps: 0,
			representatividad: 0,
		};

		console.log(title);
		dataResumen.carrera = title;
		let cantidadrespuestas = result[title].length;
		console.log("Cantidad de respuestas de la carrera: ", cantidadrespuestas);
		dataResumen.respuestasCarrera = cantidadrespuestas;
		console.log("---");

		// Promotores
		let cantidadPromotores = result[title].filter((item) => item.nps == "Promotor").length;
		console.log("Cantidad de promotores: ", cantidadPromotores);
		dataResumen.cantPromotores = cantidadPromotores;
		let porcentajePromotores = (
			(100 * result[title].filter((item) => item.nps == "Promotor").length) /
			result[title].length
		).toFixed(1);
		console.log("Porcentaje de promotores del total: ", porcentajePromotores);
		dataResumen.porcPromotores = porcentajePromotores;

		// Neutros
		let cantidadNeutros = result[title].filter((item) => item.nps == "Neutro").length;
		console.log("Cantidad de neutros: ", cantidadNeutros);
		dataResumen.cantNeutros = cantidadNeutros;
		let porcentajeNeutros = (
			(100 * result[title].filter((item) => item.nps == "Neutro").length) /
			result[title].length
		).toFixed(1);
		console.log("Porcentaje de neutros del total: ", porcentajeNeutros);
		dataResumen.porcNeutros = porcentajeNeutros;

		// Detractores
		let cantidadDetractores = result[title].filter((item) => item.nps == "Detractor").length;
		console.log("Cantidad de detractores: ", cantidadDetractores);
		dataResumen.cantDestractores = cantidadDetractores;
		let porcentajeDetractores = (
			(100 * result[title].filter((item) => item.nps == "Detractor").length) /
			result[title].length
		).toFixed(1);
		console.log("Porcentaje de detractores del total: ", porcentajeDetractores);
		dataResumen.porcDetractores = porcentajeDetractores;
		console.log("---");
		console.log("Resultado NPS: ", (parseFloat(porcentajePromotores) - parseFloat(porcentajeDetractores)).toFixed(1));
		dataResumen.resultadoNps = (parseFloat(porcentajePromotores) - parseFloat(porcentajeDetractores)).toFixed(1);

		// Representatividad
		let representatividad = ((cantidadrespuestas * 100) / localization.length).toFixed(1);
		dataResumen.representatividad = representatividad;

		// Separacion
		console.log("--------------------");
		console.log("");
		console.log("");

		dataResumenTabla.value.push(dataResumen);
	}

	// Promotores
	let promotores = localization.filter((item) => item.nps == "Promotor");
	dataGeneral.value.promotores = promotores.length;
	console.log("Promotores: ", promotores.length);

	// Neutros
	let neutros = localization.filter((item) => item.nps == "Neutro");
	dataGeneral.value.neutros = neutros.length;
	console.log("Neutros: ", neutros.length);

	// Detractores
	let detractores = localization.filter((item) => item.nps == "Detractor");
	dataGeneral.value.detractores = detractores.length;
	console.log("Detractores: ", detractores.length);
};
</script>

<style>
.btn-exportar {
	position: fixed;
	right: 20px;
	top: 20px;
}
</style>
