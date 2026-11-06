# Sample imagery

Both source images were made with the built-in imagegen tool for this rebuild. They are illustrative assets, separate from real user inventories. No personal photos were used.

## Collection sheet — public/samples/collection.webp

Use case: product-mockup. A photorealistic museum catalog contact sheet in a regular 3×3 grid on warm off-white backgrounds. Nine objects: cobalt-blue stoneware mug, silver compact camera, black headphones, pothos in terracotta, cream canvas tote, worn red canvas sneaker, green ribbed glass vase, wooden alarm clock, mustard-yellow hardback book. Soft studio light, realistic materials, no text, people, brands, or grid lines. Each object fully inside its cell. The original PNG is retained in commit `2e59c61`. The current interface uses nine cropped WebP files, `public/samples/object-0.webp` through `object-8.webp`, with native image loading. The sign-in illustration uses the optimized full sheet. Cropping and compression do not change the source artwork.

## Input fixture — public/samples/mug-original.png

Use case: photorealistic-natural. An imperfect phone snapshot of one cobalt-blue speckled stoneware mug on a scratched wooden kitchen table. Curved handle on the right, dark blue interior, brown unglazed rim, and a small visible chip at the front rim. Dish towel and kitchen clutter behind it. Crooked composition, natural window light. No people, text, brands, or watermarks.

## Catalog result — public/samples/mug-catalog.jpg

An actual BFL FLUX.2 Klein 9B output from Poof's processing pipeline using the illustrative mug fixture. The source is retained for comparison. The visual check confirmed that the blue glaze, handle, brown rim, and chip remained visible. This is one test case, not proof of universal image fidelity.

## Temporary HEIC decoder fixture

Local QA used demo/1.heic from the public [heic2any repository](https://github.com/alexcorvi/heic2any). It is not shipped as a product asset. The package declares an MIT license; its upstream source is linked above. Review dependency notices before distributing changes to its bundled decoder.
