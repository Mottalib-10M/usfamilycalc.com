// macOS Vision OCR: prints one line per recognized text box as
// "<x> <y> <w> <h>\t<text>" (normalized coordinates, origin bottom-left).
// Usage: swift ocr_vision.swift <image file>
import Foundation
import Vision
import AppKit

let path = CommandLine.arguments[1]
guard let img = NSImage(contentsOfFile: path),
      let cg = img.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
    fputs("cannot open \(path)\n", stderr); exit(1)
}
let req = VNRecognizeTextRequest()
req.recognitionLevel = .accurate
req.usesLanguageCorrection = false
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([req])
for obs in (req.results ?? []) {
    guard let top = obs.topCandidates(1).first else { continue }
    let b = obs.boundingBox
    print(String(format: "%.5f %.5f %.5f %.5f", b.origin.x, b.origin.y, b.size.width, b.size.height) + "\t" + top.string)
}
