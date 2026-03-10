// generateCertificate.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

// Use relative paths directly
const assetsPath = '../assets';

function dataURLToUint8Array(dataURL) {
  const base64 = dataURL.split(',')[1];
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const generateCertificate = async (data) => {
  // Validate only required image inputs
  const validateImage = (imageData, name) => {
    if (!imageData) return;
    if (typeof imageData !== 'string' || !imageData.startsWith('data:image/png')) {
      throw new Error(`The ${name} is not a valid PNG file!`);
    }
  };

  // Only validate required fields
  validateImage(data.logo, 'logo');
  validateImage(data.signature, 'signature');

  const {
    studentName,
    institutionName,
    visitDate,
    certificateTitle,
    logo,
    signature,
    projectTitle,
    technologies,
    duration,
    internshipStartDate,
    internshipEndDate,
    internshipCourse,
  } = data;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  // Set page size to A4 in landscape (842 x 595 points)
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Draw white background first
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1), // White background
  });

  // Draw double border using lines
  const outerMargin = 40; // Outer margin from the page edges
  const borderGap = 4; // Gap between the two borders
  const innerMargin = outerMargin + borderGap; // Inner margin for double border effect
  const borderWidth = 0.75; // Thickness of each border line
  const borderColor = rgb(0, 0, 0); // Pure black color

  // Function to draw a rectangle border
  const drawBorder = (margin) => {
    // Top border
    page.drawLine({
      start: { x: margin, y: height - margin },
      end: { x: width - margin, y: height - margin },
      thickness: borderWidth,
      color: borderColor,
    });

    // Right border
    page.drawLine({
      start: { x: width - margin, y: height - margin },
      end: { x: width - margin, y: margin },
      thickness: borderWidth,
      color: borderColor,
    });

    // Bottom border
    page.drawLine({
      start: { x: width - margin, y: margin },
      end: { x: margin, y: margin },
      thickness: borderWidth,
      color: borderColor,
    });

    // Left border
    page.drawLine({
      start: { x: margin, y: margin },
      end: { x: margin, y: height - margin },
      thickness: borderWidth,
      color: borderColor,
    });
  };

  // Draw outer border
  drawBorder(outerMargin);
  // Draw inner border
  drawBorder(innerMargin);

  // Use default font since we can't load custom fonts in browser
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  // Removed top and bottom border images as requested

  const green = rgb(0, 0.5, 0);

  // Draw dynamic logo if provided
  if (logo) {
    try {
      // logo is a data URL (base64 PNG)
      const logoBytes = dataURLToUint8Array(logo);
      const logoImg = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImg, {
        x: 60,
        y: height - 120,
        width: 140,
        height: 70,
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      // If logo fails to load, just skip it without throwing an error
    }
  }

  // Draw watermark in the center if logo is provided
  if (logo) {
    try {
      const logoBytes = dataURLToUint8Array(logo);
      const watermarkImg = await pdfDoc.embedPng(logoBytes);
      const wmWidth = 530;  // Increased from 350
      const wmHeight = 357; // Increased from 250 (maintaining aspect ratio)
      page.drawImage(watermarkImg, {
        x: (width - wmWidth) / 2,
        y: (height - wmHeight) / 2,
        width: wmWidth,
        height: wmHeight,
        opacity: 0.15, // Increased from 0.1 to 0.15 (15% opacity)
      });
    } catch (error) {
      console.error('Error loading watermark:', error);
    }
  }

  // Try to embed OldEnglish font with proper error handling
  let oldEnglishFont = null;
  try {
    const fontBytes = await fetch(new URL('../assets/Fonts/oldenglish.ttf', import.meta.url)).then(res => res.arrayBuffer());
    oldEnglishFont = await pdfDoc.embedFont(fontBytes);
  } catch (error) {
    console.error('Failed to load certificate font:', error);
    // Fallback to TimesRoman if custom font fails to load
    oldEnglishFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  }

  // Load Cinzel Decorative font for company name
  let cinzelFont = null;
  try {
    const response = await fetch(new URL('../assets/Fonts/CinzelDecorative-Bold.ttf', import.meta.url));
    if (!response.ok) throw new Error('Failed to load Cinzel Decorative font');
    const cinzelBytes = await response.arrayBuffer();
    cinzelFont = await pdfDoc.embedFont(cinzelBytes);
  } catch (error) {
    console.error('Failed to load Cinzel Decorative font:', error);
    cinzelFont = boldFont; // fallback
  }

  // Always use standard fonts as fallback
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Load Caveat Brush font for "held on ..." line
  let caveatBrushFont = null;
  try {
    const response = await fetch(new URL('../assets/Fonts/CaveatBrush-Regular.ttf', import.meta.url));
    if (!response.ok) throw new Error('Failed to load Caveat Brush font');
    const caveatBrushBytes = await response.arrayBuffer();
    caveatBrushFont = await pdfDoc.embedFont(caveatBrushBytes);
  } catch (error) {
    console.error('Failed to load Caveat Brush font:', error);
    caveatBrushFont = boldFont; // fallback
  }

  // Helper function to clean text by replacing special characters
  const cleanText = (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/\t/g, ' ').replace(/[\x00-\x1F\x7F-\x9F]/g, ' ').trim();
  };

  // Format date to Indian format (DD/MM/YYYY)
  function formatToIndianDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return ''; // Return empty string if invalid date

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Centering helper
  function centerX(text, font, size) {
    return (width - font.widthOfTextAtSize(text, size)) / 2;
  }

  // Draw the certificate title only once, centered, with the custom font and in green color
  page.drawText(certificateTitle, {
    x: centerX(certificateTitle, oldEnglishFont, 36),
    y: height - 110,
    size: 40,
    color: rgb(118 / 255, 166 / 255, 68 / 255),
    font: oldEnglishFont,
  });

  // Serial number removed as requested

  // Main body
  let y = height - 180;
  const lineSpacing = 32;

  // Add extra spacing at the top of the content
  y -= lineSpacing;

  const prefix = "This is to certify that Mr/Ms ";
  const suffix = data.year
    ? `, ${data.year} Year ${data.courseName} from `
    : `, ${data.courseName} from `;

  // Calculate widths for centering
  const prefixWidth = timesRomanFont.widthOfTextAtSize(prefix, 20);
  const studentWidth = boldFont.widthOfTextAtSize(studentName, 20);
  const suffixWidth = timesRomanFont.widthOfTextAtSize(suffix, 20);
  const totalWidth = prefixWidth + studentWidth + suffixWidth;
  const startX = (width - totalWidth) / 2;

  // Clean and draw prefix
  const cleanPrefix = cleanText(prefix);
  page.drawText(cleanPrefix, {
    x: startX,
    y,
    size: 20,
    font: timesRomanFont,
  });

  // Clean and draw student name in bold
  const cleanStudentName = cleanText(studentName);
  page.drawText(cleanStudentName, {
    x: startX + prefixWidth,
    y,
    size: 20,
    font: boldFont,
  });

  // Clean and draw suffix
  const cleanSuffix = cleanText(suffix);
  page.drawText(cleanSuffix, {
    x: startX + prefixWidth + studentWidth,
    y,
    size: 20,
    font: timesRomanFont,
  });
  y -= lineSpacing;

  // Clean and draw institute name (bold)
  const cleanInstitutionName = cleanText(institutionName);
  // Use a slightly smaller size for better fit with capital letters
  const instNameSize = 17; // Reduced from 18

  // Calculate width with the actual font and size
  const instNameWidth = cinzelFont.widthOfTextAtSize(cleanInstitutionName, instNameSize);

  page.drawText(cleanInstitutionName, {
    x: (width - instNameWidth) / 2, // Manual centering for better accuracy
    y,
    size: instNameSize,
    font: cinzelFont,
    maxWidth: width - 120, // Prevent overflow
    lineHeight: instNameSize * 1.2,
  });
  // Spacing between institution and internship text
  y -= lineSpacing;

  // Internship completion text with all details
  let visitLine = ' has successfully completed the Internship in ';

  // Add internship course if provided
  if (internshipCourse) {
    visitLine += cleanText(internshipCourse) + ' ';
  }

  const visitLineWidth = timesRomanFont.widthOfTextAtSize(visitLine, 20);

  // Build the full internship description - split for bold project title
  let internshipDescription = '';
  let projectTitleBold = '';
  let technologiesText = '';
  let durationText = '';

  if (projectTitle) {
    internshipDescription += 'doing project(s) titled ';
    projectTitleBold = cleanText(projectTitle);
    internshipDescription += '';
  }

  if (technologies) {
    technologiesText = `(using ${cleanText(technologies)})`;
  }

  // Build duration text separately for better display
  if (duration) {
    durationText = `for a duration of ${cleanText(duration)}`;
  }

  // Build separate date range text for prominence
  let dateRangeText = '';
  if (internshipStartDate && internshipEndDate) {
    const formattedStartDate = formatToIndianDate(internshipStartDate);
    const formattedEndDate = formatToIndianDate(internshipEndDate);
    dateRangeText = `from ${formattedStartDate} to ${formattedEndDate}`;
  }

  // Draw main internship description with bold project title - CENTERED ALIGNMENT
  const contentMargin = 60;
  const contentMaxWidth = width - (contentMargin * 2);
  const fontSize = 16;

  // Build parts: before project title
  const beforeProject = visitLine + 'doing project(s) titled ';
  const afterProject = '';

  // Draw text with mixed fonts (regular and bold for project title) - CENTERED
  if (projectTitle) {
    // Build the full line to calculate total width for centering
    const fullLineBeforeQuote = beforeProject;
    const fullLineAfterQuote = afterProject;

    const beforeWidth = timesRomanFont.widthOfTextAtSize(fullLineBeforeQuote, fontSize);
    const boldWidth = boldFont.widthOfTextAtSize(projectTitleBold, fontSize);
    const afterWidth = timesRomanFont.widthOfTextAtSize(fullLineAfterQuote, fontSize);
    const totalWidth = beforeWidth + boldWidth + afterWidth;

    // Check if content fits on one line
    if (totalWidth <= contentMaxWidth) {
      // Center the entire line
      const centeredX = (width - totalWidth) / 2;

      // Draw before project title (regular)
      page.drawText(fullLineBeforeQuote, {
        x: centeredX,
        y,
        size: fontSize,
        font: timesRomanFont,
      });

      // Draw project title (bold) right after
      page.drawText(projectTitleBold, {
        x: centeredX + beforeWidth,
        y,
        size: fontSize,
        font: boldFont,
      });

      // No closing quote needed
    } else {
      // Multi-line rendering: split project title into words
      const spaceWidth = boldFont.widthOfTextAtSize(' ', fontSize);

      // First line: "...doing project(s) titled"
      const firstLineText = visitLine + 'doing project(s) titled ';
      const firstLineWidth = timesRomanFont.widthOfTextAtSize(firstLineText, fontSize);
      const firstLineX = (width - firstLineWidth) / 2;

      page.drawText(firstLineText, {
        x: firstLineX,
        y,
        size: fontSize,
        font: timesRomanFont,
      });

      y -= lineSpacing * 0.9; // Move to next line

      // Split project title into words and render with wrapping
      const words = projectTitleBold.split(' ');
      let currentLine = '';
      let lines = [];

      for (let i = 0; i < words.length; i++) {
        const testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
        const testWidth = boldFont.widthOfTextAtSize(testLine, fontSize);

        // Check if line fits
        const maxLineWidth = contentMaxWidth;

        if (testWidth <= maxLineWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) {
            lines.push(currentLine);
            currentLine = words[i];
          } else {
            // Single word too long, add it anyway
            lines.push(words[i]);
            currentLine = '';
          }
        }
      }

      // Add the last line
      if (currentLine) {
        lines.push(currentLine);
      }

      // Draw each line of project title (centered and bold)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isLastLine = i === lines.length - 1;

        // Center the text (same for all lines)
        {
          const lineWidth = boldFont.widthOfTextAtSize(line, fontSize);
          const lineX = (width - lineWidth) / 2;

          page.drawText(line, {
            x: lineX,
            y,
            size: fontSize,
            font: boldFont,
          });
        }

        if (i < lines.length - 1) {
          y -= lineSpacing * 0.9; // Move to next line
        }
      }
    }
  } else {
    // If no project title, just draw the regular text centered
    const fullText = visitLine + internshipDescription;
    page.drawText(fullText, {
      x: 60,
      y,
      size: fontSize,
      font: timesRomanFont,
      maxWidth: contentMaxWidth,
      lineHeight: fontSize * 1.4,
    });
  }

  // Minimal spacing after internship description
  y -= lineSpacing * 0.8;

  // Draw technologies on separate line if available - CENTERED
  if (technologies) {
    const techWidth = timesRomanFont.widthOfTextAtSize(technologiesText, fontSize);
    const techX = (width - techWidth) / 2;

    page.drawText(technologiesText, {
      x: techX,
      y,
      size: fontSize,
      font: timesRomanFont,
    });
    // Minimal spacing after technologies
    y -= lineSpacing * 0.7;
  }

  // Draw duration on separate line if available - CENTERED with wrapping
  if (durationText) {
    const durationLines = Math.ceil(durationText.length / 70);

    if (durationLines === 1) {
      // If fits on one line, center it
      const durationWidth = timesRomanFont.widthOfTextAtSize(durationText, fontSize);
      const durationX = (width - durationWidth) / 2;

      page.drawText(durationText, {
        x: durationX,
        y,
        size: fontSize,
        font: timesRomanFont,
      });
    } else {
      // If multiple lines, use centered margin
      page.drawText(durationText, {
        x: 60,
        y,
        size: fontSize,
        font: timesRomanFont,
        maxWidth: contentMaxWidth,
        lineHeight: fontSize * 1.4,
      });
    }
    y -= lineSpacing * 0.8;
  }

  // Draw internship date range - CENTERED
  if (dateRangeText) {
    const dateRangeWidth = timesRomanFont.widthOfTextAtSize(dateRangeText, fontSize);
    const dateRangeX = (width - dateRangeWidth) / 2;

    page.drawText(dateRangeText, {
      x: dateRangeX,
      y,
      size: fontSize,
      font: timesRomanFont, // Regular font
      color: rgb(0, 0, 0),
    });
    y -= lineSpacing * 1;
  }

  // at
  const atLine = 'at';
  page.drawText(atLine, {
    x: centerX(atLine, timesRomanFont, 20),
    y,
    size: 20,
    font: timesRomanFont,
  });
  y -= lineSpacing;

  // Company name rendered in 3 parts so 'e' stays true lowercase.
  // Cinzel is a small-caps font — it cannot render genuine lowercase letters.
  // So: "AAHA "=cinzel | "e"=timesRoman | "Com Solutions"=cinzel, centred together.
  const compNameSize = 24;
  const compGreen = rgb(118 / 255, 166 / 255, 68 / 255);
  const part1 = 'AAHA ';
  const part2 = 'e';
  const part3 = 'Com Solutions';
  const w1 = cinzelFont.widthOfTextAtSize(part1, compNameSize);
  const w2 = timesRomanFont.widthOfTextAtSize(part2, compNameSize);
  const w3 = cinzelFont.widthOfTextAtSize(part3, compNameSize);
  const compStartX = (width - (w1 + w2 + w3)) / 2;

  page.drawText(part1, { x: compStartX, y, size: compNameSize, font: cinzelFont, color: compGreen });
  page.drawText(part2, { x: compStartX + w1, y, size: compNameSize, font: timesRomanFont, color: compGreen });
  page.drawText(part3, { x: compStartX + w1 + w2, y, size: compNameSize, font: cinzelFont, color: compGreen });
  y -= lineSpacing;


  // Company description
  const companyDescription = '(a software development company)';
  page.drawText(companyDescription, {
    x: centerX(companyDescription, timesRomanFont, 14),
    y,
    size: 14,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  y -= lineSpacing;

  // Company address
  const addressLine = ' Located at No:27, 3rd Cross, SithanKudi, Brindavan Colony, Puducherry-605013';
  page.drawText(addressLine, {
    x: centerX(addressLine, timesRomanFont, 14),
    y,
    size: 14,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  y -= lineSpacing;

  // Best wishes line
  const wishesLine = 'We wish him/her success and betterment in future.';
  page.drawText(wishesLine, {
    x: centerX(wishesLine, timesRomanFont, 20),
    y,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0, 0),
  });
  y -= lineSpacing;


  // Date (bottom left)
  const formattedVisitDate = formatToIndianDate(visitDate);
  page.drawText(`Date: ${formattedVisitDate}`, {
    x: 60,
    y: 60,
    size: 14,
    font: boldFont, // Changed to bold font
  });

  // Authorized Signatory (bottom right)
  page.drawText('Authorized Signatory', {
    x: width - 200,
    y: 70,
    size: 14,
    font: boldFont,
  })
  // Draw dynamic signature if provided
  if (signature) {
    try {
      // signature is a data URL (base64 PNG)
      const signatureBytes = dataURLToUint8Array(signature);
      const signatureImg = await pdfDoc.embedPng(signatureBytes);
      page.drawImage(signatureImg, {
        x: width - 180,
        y: 40,
        width: 120,
        height: 90,
      });
    } catch (error) {
      console.error('Error loading signature:', error);

      // If signature fails to load, just skip it without throwing an error
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${studentName}_Certificate.pdf`;
  link.click();
};

export default generateCertificate; 
