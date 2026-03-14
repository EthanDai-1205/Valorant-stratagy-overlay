use image::{DynamicImage, ImageBuffer, Luma};

/// Preprocess screenshot for optimal OCR and computer vision performance
pub fn preprocess_screenshot(image: &DynamicImage) -> DynamicImage {
    // Convert to grayscale
    let grayscale = image.to_luma8();

    // Apply threshold to binarize image (text becomes black/white)
    let threshold = 127;
    let binarized: ImageBuffer<Luma<u8>, Vec<u8>> = ImageBuffer::from_fn(
        grayscale.width(),
        grayscale.height(),
        |x, y| {
            let pixel = grayscale.get_pixel(x, y);
            if pixel[0] > threshold {
                Luma([255])
            } else {
                Luma([0])
            }
        }
    );

    DynamicImage::ImageLuma8(binarized)
}

/// Resize image to target height while maintaining aspect ratio
pub fn resize_image(image: &DynamicImage, target_height: u32) -> DynamicImage {
    let aspect_ratio = image.width() as f32 / image.height() as f32;
    let target_width = (target_height as f32 * aspect_ratio) as u32;

    image.resize_exact(target_width, target_height, image::imageops::FilterType::Lanczos3)
}

/// Crop image to specified region
pub fn crop_image(image: &DynamicImage, x: u32, y: u32, width: u32, height: u32) -> DynamicImage {
    image.crop_imm(x, y, width, height)
}
