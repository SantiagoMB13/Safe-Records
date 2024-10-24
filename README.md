# 🛡️ SafeRecords

Este proyecto es una solución completa para la **anonimización de registros médicos** directamente en el navegador. Utiliza modelos de inteligencia artificial para identificar y anonimizar automáticamente información sensible en textos, asegurando la privacidad de los datos médicos pero manteniendo la coherencia de forma que la información se mantiene relevante.

## 🚀 Descripción

El propósito de este proyecto es proporcionar una herramienta fácil de usar para anonimizar registros médicos. Está diseñado para procesar texto ingresado manualmente o cargado desde archivos (.txt, .pdf, .docx), utilizando un modelo de **Reconocimiento de Entidades Nombradas (NER)** entrenado en múltiples idiomas.

### Características principales:
- **Anonimización automática**: Detecta y reemplaza información sensible como nombres, ubicaciones y organizaciones.
- **Modo avanzado**: Usa la biblioteca Faker.js para reemplazar entidades con datos falsos pero plausibles.
- **Interfaz intuitiva**: Interactúa con la aplicación directamente desde el navegador.
- **Procesamiento de múltiples formatos**: Soporta archivos `.txt`, `.pdf` y `.docx`.
- **Anonimización en lote**: Procesa múltiples archivos a la vez y genera archivos anonimizados.
- **Conservación de la relación de fechas**: Todas las fechas se desplazan un mismo intervalo de tiempo para mantener la relación entre ellas.

## 🛠️ Tecnologías Utilizadas

- **HuggingFace**: Plataforma para implementar modelos de machine learning.
- **PyTorch**: Framework de deep learning utilizado para entrenar y desplegar modelos.
- **ONNX**: Formato abierto para representar modelos de machine learning, facilitando su interoperabilidad entre diferentes frameworks.
- **JavaScript**: Lenguaje principal para la lógica de la aplicación.
- **Transformers.js**: Biblioteca para desplegar modelos de Hugging Face directamente en el navegador.
- **Faker.js**: Genera datos falsos pero realistas para la anonimización avanzada.
- **JSZip**: Permite descargar múltiples archivos como un archivo ZIP.
- **pdf.js**: Extrae texto de archivos PDF.
- **Mammoth.js**: Convierte archivos `.docx` a texto plano.

## 📦 Instalación y Ejecución

**Para usar esta herramienta en la nube:**
  https://safe-records.vercel.app/

**Para usar esta herramienta en tu entorno local**:

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/SantiagoMB13/Safe-Records.git
2. **Navega a la carpeta del proyecto**:
    ```bash
    cd Safe-Records
3. **Despliega el programa en un servidor local usando Docker**:

   - **Si no tienes Docker instalado**, puedes descargarlo [aquí](https://docs.docker.com/get-docker/).
   
   - **Construir la imagen de Docker**:
     ```bash
     docker build -t Safe-Records .
     ```

   - **Ejecutar el contenedor**:
     ```bash
     docker run -d -p 8080:80 Safe-Records
     ```

4. **Accede a la aplicación** desde tu navegador en `http://localhost:8080`.

**NOTA**: El programa funciona cargando localmente un modelo preentrenado de HuggingFace para la anonimización de registros médicos. Esto permite procesar los datos en tiempo real sin depender de servidores externos, lo que garantiza un control total sobre los datos. Es decir que se necesita una conexión a internet para la carga del modelo, pero no es necesario para la ejecución del mismo una vez ya sea cargado.

## ⚙️ Requisitos

No se necesitan dependencias adicionales. Todo se carga a través de CDN en el navegador. Sin embargo, si quieres desplegarla localmente en un contenedor debes tener Docker instalado en tu equipo.

## 👨‍💻 Uso

### Anonimización de Texto y Archivos
   - Ingresa o pega el texto en el campo de texto.
   - Sube uno o más archivos (.txt, .pdf, .docx).
   - Verifica el modelo que vas a utilizar para la anonimización y cámbialo según consideres necesario.
   - Selecciona el modo de anonimización: **Genérico** o **Avanzado**.
   - Haz click en **"Anonimizar"**.
   - Verifica los resultados de la anonimización y editalos a tu gusto según consideres conveniente.
   - Descarga los resultados anonimizados comprimidos en un archivo .zip.

### Modos de Anonimización:
- **Genérico**: Reemplaza entidades detectadas con términos genéricos como `[persona]`, `[lugar]`, `[organización]`.
- **Avanzado**: Reemplaza entidades con datos falsos pero verosímiles, generados con Faker.js.

### Selección del Modelo

**Carga desde HuggingFace**:
El programa permite cargar fácilmente el modelo por otro modelo preentrenado de HuggingFace que cumpla con los requisitos necesarios. Para esto en el input de "selección del modelo" puede cambiar el que se carga por defecto reemplazando el nombre que aparece en el repositorio de HuggingFace. Por ejemplo:
```
Xenova/distilbert-base-multilingual-cased-ner-hrl
```
**Carga de un modelo local**:
En el archivo `index.js`, se puede modificar el modelo que se desea utilizar para el proceso de clasificación de entidades (NER). Por defecto, el sistema carga un modelo desde Hugging Face, pero también es posible seleccionar un modelo almacenado localmente. Para esto, localiza las siguientes líneas donde se define el modelo cargado en el archivo `index.js`:
  
  ```javascript
  env.allowLocalModels = false;
  const pipe = await pipeline('token-classification', 'Xenova/bert-base-multilingual-cased-ner-hrl');
  ```
Para cambiar el modelo, debes modificar el nombre del modelo de Hugging Face o proporcionar la ruta de un modelo local, colocando la propiedad allowLocalModels como True. Recuerda que siempre debes asegurarte de que el modelo a utilizar esté compilado en ONNX.

**Requisitos del modelo**: Aunque la solución permite cambiar el modelo fácilmente, este debe cumplir con los siguientes requisitos:

- **Estructura del modelo**: Este proyecto usa la librería de Transformers.js, por lo que además de ser un modelo compilado en ONNX, debe seguir cierta estructura similar a esta:
```
bert-base-uncased/
├── config.json
├── tokenizer.json
├── tokenizer_config.json
└── onnx/
    ├── model.onnx
    └── model_quantized.onnx
```
En caso de que tengas un modelo preentrenado en un formato distinto a ONNX, puedes utilizar el [script de conversión de HuggingFace](https://github.com/huggingface/transformers.js/blob/main/scripts/convert.py)

- **Etiquetas esperadas**: Es importante que el modelo utilice las etiquetas estándar para entidades nombradas: `PER` (persona), `LOC` (ubicación), `ORG` (organización) y `MISC` (misceláneo). Si el modelo utiliza etiquetas diferentes, la herramienta puede no funcionar correctamente.

## 🎯 Objetivos y Beneficios

El objetivo principal de este proyecto es proporcionar una herramienta que permita a los profesionales de la salud, investigadores, y organizaciones manejar registros médicos de manera segura, asegurando la protección de la identidad de los pacientes.

### Beneficios:
- **Privacidad**: Protección integral de la información sensible.
- **Simplicidad**: Procesamiento fácil y directo desde el navegador.
- **Versatilidad**: Soporte para múltiples formatos de archivo.
- **Seguridad**: Todo el procesamiento ocurre en el navegador. No se envía información a servidores externos.
- **Compatibilidad**: Probado en los navegadores más recientes (Chrome, Firefox, Edge).

---

¡Gracias por usar esta herramienta! Si encuentras útil este proyecto, considera darle una ⭐ en GitHub.

