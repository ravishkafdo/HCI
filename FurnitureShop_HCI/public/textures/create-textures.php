<?php
// Function to create a colored image
function createColoredImage($width, $height, $r, $g, $b, $filename) {
    $image = imagecreatetruecolor($width, $height);
    $color = imagecolorallocate($image, $r, $g, $b);
    imagefill($image, 0, 0, $color);
    
    // Save as JPEG
    imagejpeg($image, $filename, 90);
    imagedestroy($image);
    
    echo "Created $filename<br>";
}

// Create wood texture (brown)
createColoredImage(256, 256, 139, 69, 19, __DIR__ . '/wood.jpg');

// Create floor texture (gray)
createColoredImage(256, 256, 169, 169, 169, __DIR__ . '/floor.jpg');

// Create wall texture (light gray)
createColoredImage(256, 256, 224, 224, 224, __DIR__ . '/wall.jpg');

// Create fabric texture (blue)
createColoredImage(256, 256, 70, 130, 180, __DIR__ . '/fabric.jpg');

echo "All textures created successfully!";
?> 