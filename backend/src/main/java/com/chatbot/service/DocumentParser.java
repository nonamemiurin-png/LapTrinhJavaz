package com.chatbot.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFShape;
import org.apache.poi.xslf.usermodel.XSLFTextShape;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Component
public class DocumentParser {

    public String parse(String filePath, String contentType) throws IOException {
        if (contentType != null && (contentType.contains("pdf") || filePath.endsWith(".pdf"))) {
            return parsePDF(filePath);
        } else if (contentType != null && (contentType.contains("word") || contentType.contains("officedocument") || filePath.endsWith(".docx"))) {
            return parseDOCX(filePath);
        } else if (filePath.toLowerCase().endsWith(".pptx")) {
            return parsePPTX(filePath);
        } else {
            return parseTXT(filePath);
        }
    }

    public String parsePPTX(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XMLSlideShow presentation = new XMLSlideShow(fis)) {
            StringBuilder text = new StringBuilder();
            for (int i = 0; i < presentation.getSlides().size(); i++) {
                text.append("\n[Slide ").append(i + 1).append("]\n");
                for (XSLFShape shape : presentation.getSlides().get(i).getShapes()) {
                    if (shape instanceof XSLFTextShape textShape) {
                        text.append(textShape.getText()).append('\n');
                    }
                }
            }
            return text.toString();
        }
    }

    public String parsePDF(String filePath) throws IOException {
        try (PDDocument document = Loader.loadPDF(new File(filePath))) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String parseDOCX(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath);
             XWPFDocument document = new XWPFDocument(fis)) {
            StringBuilder text = new StringBuilder();
            for (XWPFParagraph para : document.getParagraphs()) {
                text.append(para.getText()).append("\n");
            }
            return text.toString();
        }
    }

    public String parseTXT(String filePath) throws IOException {
        try (FileInputStream fis = new FileInputStream(filePath)) {
            byte[] data = new byte[(int) new File(filePath).length()];
            int read = fis.read(data);
            return new String(data, 0, read, "UTF-8");
        }
    }
}
