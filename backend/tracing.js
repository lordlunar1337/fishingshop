const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");

const traceExporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces"
});

const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics"
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "fishingshop-backend"
  }),
  traceExporter,
  metricExporter,
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start().catch((err) => {
  console.error(err);
});

process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .catch(() => {})
    .finally(() => {
      process.exit(0);
    });
});
