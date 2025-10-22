// NuGet: DocumentFormat.OpenXml
// Namespaces:
using System.IO;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

public static class ReportComposer
{
    // Part 3
    public static string CreateSimpleReport(string clientName, string reportType)
    {
      var fileName = "GeneratedReport.docx";
      if (File.Exists(fileName)) File.Delete(fileName);

      using (var doc = WordprocessingDocument.Create(fileName, WordprocessingDocumentType.Document))
      {
        var mainPart = doc.AddMainDocumentPart();
        mainPart.Document = new Document(new Body());

        var p = new Paragraph(
          new ParagraphProperties(new SpacingBetweenLines { After = "160" }),
          new Run(new RunProperties(new Bold()),
                  new Text($"Report: {reportType} for Client: {clientName}"))
        );
        mainPart.Document.Body.AppendChild(p);
        mainPart.Document.Save();
      }
      return Path.GetFullPath(fileName);
    }
}

/*
Architectural note (2–3 sentences):
This runs on a server/agent to use the full .NET OpenXML SDK with reliable file I/O,
secure credentials, and access to internal data sources. Generating DOCX on the client
(Office task pane JavaScript) is sandboxed and inconsistent across environments, while
server-side ensures auditability, versioned templates, and consistent outputs.
*/
