Kokoodi Technical Assessment — End-to-End Financial Report Generator

Live UI: (add your GitHub Pages link here)  
Repo: (this repository)

Part 1 — UI/UX (Narrow Task Pane)
- Mobile-first layout designed for ~350px width.
- Inputs: Report Type (chips), Reporting Year (dropdown), Client Name/ID (text), and a primary “Generate Report” button.

Part 2 — Agent Logic (Frontend → Backend)
- `prepareAgentRequest()` collects the three inputs, validates, and returns a single JSON object:
```json
{ "reportType":"P&L", "reportYear":2025, "clientId":"ABC123", "requestId":"req_..." }
```
Service Endpoint (hypothetical): POST https://api.kokoodi.com/v1/reports/generate
Backend Agent’s Role: Validate fields, enrich with client metadata (e.g., legal name, FY bounds), select the correct OpenXML template pipeline for the chosen report type, call the C# routine to compose the DOCX, persist to object storage, and return a signed download URL plus telemetry.

Part 3 — Backend (C#/OpenXML)
   NuGet: DocumentFormat.OpenXml
	 Namespaces: DocumentFormat.OpenXml, DocumentFormat.OpenXml.Packaging, DocumentFormat.OpenXml.Wordprocessing
Method: CreateSimpleReport(string clientName, string reportType) creates GeneratedReport.docx and writes:
Report: [Report Type] for Client: [Client Name]
Why server-side? It leverages full .NET/OpenXML, secure data access, and consistent templating—more reliable than a sandboxed task pane.

Part 4 — Bonus Feature
Remember settings (opt-in): Toggle stores last report type/year/client in localStorage.
Value: Reduces repetitive entry in batch workflows and lowers error risk, while keeping user control (opt-in).
