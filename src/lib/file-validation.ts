/**
 * File upload validation configuration
 */

export const ALLOWED_MIME_TYPES = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.ms-excel': ['.xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    'application/vnd.ms-powerpoint': ['.ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'text/plain': ['.txt'],
    'text/csv': ['.csv'],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_MEETING = 20;

export interface FileValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate file type and size
 */
export function validateFile(file: File): FileValidationResult {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `Datei ist zu groß. Maximum: ${formatFileSize(MAX_FILE_SIZE)}`,
        };
    }

    // Check MIME type
    if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.type)) {
        return {
            valid: false,
            error: 'Dateityp nicht erlaubt. Erlaubte Formate: PDF, Word, Excel, PowerPoint, Bilder (JPG, PNG, GIF), TXT, CSV',
        };
    }

    // Check file extension matches MIME type
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const allowedExtensions = ALLOWED_MIME_TYPES[file.type as keyof typeof ALLOWED_MIME_TYPES] as readonly string[] | undefined;
    
    if (!allowedExtensions || !allowedExtensions.includes(extension)) {
        return {
            valid: false,
            error: 'Dateiendung stimmt nicht mit dem Dateityp überein',
        };
    }

    return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Get accepted file types for input element
 */
export function getAcceptedFileTypes(): string {
    return Object.values(ALLOWED_MIME_TYPES)
        .flat()
        .join(',');
}
