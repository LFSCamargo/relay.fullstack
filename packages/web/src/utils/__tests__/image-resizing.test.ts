/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ImageResizing } from "../image-resizing";

describe("ImageResizing.compressImage", () => {
  let originalCreateElement: typeof document.createElement;
  let originalImage: typeof Image;
  let fakeCanvas: any;
  let fakeCtx: any;
  global.URL.createObjectURL = vi.fn();

  beforeEach(() => {
    originalCreateElement = document.createElement;
    originalImage = (global as any).Image;

    fakeCtx = {
      drawImage: vi.fn(),
    };

    fakeCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => fakeCtx),
      toDataURL: vi.fn(() => "data:image/jpeg;fakebase64"),
    };

    // Mock creating canvas
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "canvas") return fakeCanvas;
      return originalCreateElement.call(document, tag as string);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    (global as any).Image = originalImage;
  });

  function mockImageLoad(width: number, height: number) {
    // Fake Image class
    class FakeImage {
      onload: (() => void) | null = null;
      src = "";
      width = width;
      height = height;
      constructor() {
        // trigger load asynchronously
        setTimeout(() => {
          return this.onload && this.onload();
        }, 0);
      }
    }
    (global as any).Image = FakeImage;
  }

  it("should return data URL when image smaller than limits", async () => {
    mockImageLoad(400, 200);
    const file = new File([""], "small.jpg", { type: "image/jpeg" });
    const result = await ImageResizing.compressImage(file, 800, 800);
    expect(result).toBe("data:image/jpeg;fakebase64");
    expect(fakeCanvas.width).toBe(400);
    expect(fakeCanvas.height).toBe(200);
    expect(fakeCtx.drawImage).toHaveBeenCalled();
    expect(fakeCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.8);
  });

  it("should resize width when image wider than maxWidth", async () => {
    mockImageLoad(1600, 400);
    const file = new File([""], "wide.jpg", { type: "image/jpeg" });
    const result = await ImageResizing.compressImage(file, 800, 800);
    // aspect ratio = 1600/400 = 4, so new height = 800/4 = 200
    expect(result).toBe("data:image/jpeg;fakebase64");
    expect(fakeCanvas.width).toBe(800);
    expect(fakeCanvas.height).toBe(200);
  });

  it("should resize height when image taller than maxHeight", async () => {
    mockImageLoad(400, 1600);
    const file = new File([""], "tall.jpg", { type: "image/jpeg" });
    const result = await ImageResizing.compressImage(file, 800, 800);
    // aspect ratio = 400/1600 = 0.25, new width = 800 * 0.25 = 200
    expect(result).toBe("data:image/jpeg;fakebase64");
    expect(fakeCanvas.width).toBe(200);
    expect(fakeCanvas.height).toBe(800);
  });

  it("should return null if canvas context is unavailable", async () => {
    // Canvas getContext returns null
    fakeCanvas.getContext = vi.fn(() => null);
    mockImageLoad(400, 200);
    const file = new File([""], "nocanvas.jpg", { type: "image/jpeg" });
    const result = await ImageResizing.compressImage(file, 800, 800);
    expect(result).toBeNull();
  });
});
