import { Document, Packer, Paragraph, TextRun, HeadingLevel, ShadingType, AlignmentType, PageBreak, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

interface Variation {
    id: string;
    versionNumber: number;
    aiOutput: string;
    tokensTotal: number;
    latencyMs: number;
    createdAt: Date;
}

const SHADING_COLOR_PROMPT = "F5F3FF"; // violet-50
const SHADING_COLOR_OUTPUT = "FFFFFF"; // white
const TITLE_COLOR = "7C3AED"; // violet-600
const BORDER_COLOR_PROMPT = "C4B5FD"; // violet-300
const BORDER_COLOR_OUTPUT = "E2E8F0"; // slate-200

function createShadedBox(text: string, bgColor: string, borderColor: string) {
    // We split by newlines to keep formatting
    const lines = text.split('\n');
    return lines.map((line, idx) => {
        return new Paragraph({
            children: [
                new TextRun({
                    text: line,
                    font: "Arial",
                    size: 22, // 11pt
                })
            ],
            shading: {
                type: ShadingType.CLEAR,
                fill: bgColor,
            },
            spacing: {
                after: lines.length - 1 === idx ? 200 : 0, // add spacing at the end of the box
            },
            // Hack to make it look like a box: add borders to the paragraph
            border: {
                top: idx === 0 ? { color: borderColor, space: 4, style: BorderStyle.SINGLE, size: 6 } : undefined,
                bottom: idx === lines.length - 1 ? { color: borderColor, space: 4, style: BorderStyle.SINGLE, size: 6 } : undefined,
                left: { color: borderColor, space: 6, style: BorderStyle.SINGLE, size: 6 },
                right: { color: borderColor, space: 6, style: BorderStyle.SINGLE, size: 6 },
            }
        });
    });
}

export async function exportSingleResponseToDocx(
    title: string,
    renderedPrompt: string,
    aiOutput: string,
    tokensTotal?: number,
    latencyMs?: number
) {
    const doc = new Document({
        sections: [
            {
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                        children: [
                            new TextRun({
                                text: title,
                                size: 40, // 20pt
                                bold: true,
                                color: TITLE_COLOR,
                            }),
                        ],
                    }),

                    // Metadata
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                        children: [
                            new TextRun({
                                text: `Fecha de Exportación: ${new Date().toLocaleString()}`,
                                color: "666666",
                                italics: true,
                            }),
                            ...(tokensTotal || latencyMs ? [
                                new TextRun({ text: " | ", color: "666666" }),
                                new TextRun({
                                    text: `Tokens: ${tokensTotal ?? '-'} • Latencia: ${latencyMs ? latencyMs + 'ms' : '-'}`,
                                    color: "666666",
                                    bold: true,
                                })
                            ] : [])
                        ],
                    }),

                    // Prompt Section
                    new Paragraph({
                        spacing: { before: 400, after: 120 },
                        children: [
                            new TextRun({
                                text: "Prompt Renderizado (Enviado)",
                                size: 32, // 16pt
                                bold: true,
                                color: "475569", // slate-600
                            }),
                        ],
                    }),
                    ...createShadedBox(renderedPrompt, SHADING_COLOR_PROMPT, BORDER_COLOR_PROMPT),

                    // Response Section
                    new Paragraph({
                        spacing: { before: 400, after: 120 },
                        children: [
                            new TextRun({
                                text: "Respuesta Generada por IA",
                                size: 32, // 16pt
                                bold: true,
                                color: TITLE_COLOR,
                            }),
                        ],
                    }),
                    ...createShadedBox(aiOutput, SHADING_COLOR_OUTPUT, BORDER_COLOR_OUTPUT),
                ],
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `exportacion_${Date.now()}.docx`);
}

export async function exportMultiResponseToDocx(
    renderedPrompt: string,
    modelConfig: any,
    variations: Variation[]
) {

    // Create children array
    const children: Paragraph[] = [
        // Title
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
                new TextRun({
                    text: "Comparación de Respuestas Generadas",
                    size: 40, // 20pt
                    bold: true,
                    color: TITLE_COLOR,
                }),
            ],
        }),

        // Metadata
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
                new TextRun({
                    text: `Modelo: ${modelConfig?.model || 'Desconocido'} | Temp: ${modelConfig?.temperature ?? '-'} | Resultados: ${variations.length}`,
                    color: "334155", // slate-700
                    bold: true,
                    size: 24, // 12pt
                }),
            ],
        }),

        // Prompt Shared Section
        new Paragraph({
            spacing: { before: 400, after: 120 },
            children: [
                new TextRun({
                    text: "Prompt Compartido",
                    size: 32, // 16pt
                    bold: true,
                    color: "475569", // slate-600
                }),
            ],
        }),
        ...createShadedBox(renderedPrompt, SHADING_COLOR_PROMPT, BORDER_COLOR_PROMPT),

        // Title for responses
        new Paragraph({
            spacing: { before: 400, after: 200 },
            children: [
                new TextRun({
                    text: "Respuestas Generadas",
                    size: 32, // 16pt
                    bold: true,
                    color: TITLE_COLOR,
                }),
            ],
        }),
    ];

    // Add each variation
    variations.forEach((v, idx) => {
        children.push(
            new Paragraph({
                spacing: { before: 300, after: 120 },
                children: [
                    new TextRun({
                        text: `Respuesta ${variations.length - idx}  `,
                        bold: true,
                        size: 30, // 15pt
                        color: TITLE_COLOR,
                    }),
                    new TextRun({
                        text: `(Versión ${v.versionNumber} | ${v.tokensTotal} tokens | ${v.latencyMs}ms)`,
                        italics: true,
                        color: "64748B", // slate-500
                        size: 22, // 11pt
                    }),
                ]
            }),
            ...createShadedBox(v.aiOutput, SHADING_COLOR_OUTPUT, BORDER_COLOR_OUTPUT)
        );

        // Add minimal spacing between variations
        if (idx < variations.length - 1) {
            children.push(new Paragraph({
                spacing: { before: 200, after: 200 },
            }));
        }
    });

    const doc = new Document({
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `comparacion_respuestas_${Date.now()}.docx`);
}
