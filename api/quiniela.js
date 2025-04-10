import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const url = "https://www.tujugada.com.ar/quiniela-salta-estadisticas.asp";

    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const secciones = ["CABEZA", "A LOS 5", "A LOS 10", "A LOS 20"];
    const resultados = [];

    secciones.forEach((seccion) => {
      const titulo = $(`b:contains(${seccion})`).first();
      const tabla = titulo.nextAll("table[bgcolor='#0E7D2F']").first();

      tabla.find("tr").each((_, row) => {
        const tds = $(row).find("td");
        if (tds.length >= 2) {
          const numero = parseInt($(tds[0]).text().trim(), 10);
          const veces = parseInt($(tds[1]).text().trim(), 10);
          if (!isNaN(numero) && !isNaN(veces)) {
            resultados.push({
              seccion,
              numero,
              veces
            });
          }
        }
      });
    });

    res.status(200).json(resultados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed" });
  }
}
