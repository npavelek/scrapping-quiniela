import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/api/quiniela", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.tujugada.com.ar/quiniela-salta-estadisticas.asp", {
      waitUntil: "networkidle2"
    });

    const data = await page.evaluate(() => {
      const secciones = ["CABEZA", "A LOS 5", "A LOS 10", "A LOS 20"];
      const resultados = [];

      secciones.forEach((seccion) => {
        const bTag = Array.from(document.querySelectorAll("b"))
          .find((el) => el.textContent.trim() === seccion);
        if (!bTag) return;

        const tabla = bTag.parentElement?.nextElementSibling;
        if (!tabla || !tabla.querySelectorAll) return;

        const filas = tabla.querySelectorAll("tr");
        filas.forEach((fila) => {
          const celdas = fila.querySelectorAll("td");
          if (celdas.length >= 2) {
            const numero = parseInt(celdas[0].innerText.trim(), 10);
            const veces = parseInt(celdas[1].innerText.trim(), 10);
            if (!isNaN(numero) && !isNaN(veces)) {
              resultados.push({ seccion, numero, veces });
            }
          }
        });
      });

      return resultados;
    });

    await browser.close();
    res.json(data);
  } catch (error) {
    console.error("❌ Error en scraping:", error.message);
    res.status(500).json({ error: "Scraping failed" });
  }
});

app.listen(3000, () => {
  console.log("✅ API running on http://localhost:3000/api/quiniela");
});


