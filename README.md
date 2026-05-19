# Aurex — AI-Powered Portfolio Intelligence

**Aurex** es una plataforma web de inteligencia financiera orientada al análisis de portafolios de inversión simulados. El proyecto permite a los usuarios crear portafolios, registrar operaciones ficticias, visualizar métricas financieras, consultar activos de mercado, crear alertas y generar análisis educativo asistido por inteligencia artificial.

El objetivo principal de Aurex es ofrecer una experiencia tipo **fintech premium**, combinando una interfaz moderna con una arquitectura full-stack real basada en frontend web, backend API, base de datos, seguridad, despliegue en la nube y separación clara de responsabilidades.

---

## Tabla de contenidos

- [Descripción del proyecto](#descripción-del-proyecto)
- [Problema que resuelve](#problema-que-resuelve)
- [Para qué sirve](#para-qué-sirve)
- [Funcionamiento general](#funcionamiento-general)
- [Características principales](#características-principales)
- [Arquitectura de software](#arquitectura-de-software)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Modelo de datos principal](#modelo-de-datos-principal)
- [Módulos del backend](#módulos-del-backend)
- [Módulos del frontend](#módulos-del-frontend)
- [Endpoints principales](#endpoints-principales)
- [Seguridad](#seguridad)
- [Despliegue](#despliegue)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución local](#ejecución-local)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Estado actual del proyecto](#estado-actual-del-proyecto)
- [Roadmap](#roadmap)
- [Disclaimer financiero](#disclaimer-financiero)
- [Autor](#autor)
- [Resumen](#resumen)

---

## Descripción del proyecto

Aurex es una aplicación web full-stack que permite simular y analizar portafolios de inversión sin utilizar dinero real. La plataforma está diseñada para usuarios interesados en aprender sobre inversiones, visualizar métricas financieras y comprender cómo se distribuye el capital dentro de un portafolio.

La aplicación combina:

- Dashboard financiero.
- Portafolios simulados.
- Activos como criptomonedas, acciones y ETFs.
- Transacciones ficticias de compra y venta.
- Métricas de rendimiento.
- Alertas de precio.
- Análisis educativo con IA.
- Backend seguro con JWT.
- Base de datos PostgreSQL.
- Despliegue público en la nube.

Aurex no ejecuta operaciones reales ni se conecta a bancos, brokers o wallets. Su enfoque es educativo, analítico y demostrativo.

---

## Problema que resuelve

Muchas personas que desean aprender sobre inversiones no tienen una herramienta clara para practicar la gestión de portafolios sin poner en riesgo dinero real.

Aurex soluciona este problema al ofrecer un entorno seguro donde el usuario puede:

- Simular compras y ventas.
- Construir un portafolio.
- Ver cómo se distribuye su capital.
- Analizar ganancias y pérdidas.
- Crear alertas de precio.
- Recibir explicaciones educativas sobre su portafolio.
- Entender conceptos como riesgo, concentración y diversificación.

---

## Para qué sirve

Aurex sirve como una plataforma de práctica, análisis y educación financiera.

Permite responder preguntas como:

```txt
¿Cuánto vale mi portafolio simulado?
¿Qué activos tengo registrados?
¿Cuánto estoy ganando o perdiendo?
¿Cómo está distribuido mi capital?
¿Qué tan concentrado o riesgoso está mi portafolio?
¿Qué activos del mercado estoy monitoreando?
¿Qué alertas quiero configurar?
¿Qué análisis educativo puede generar la IA?
