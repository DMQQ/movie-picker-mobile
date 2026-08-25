import { memo, useMemo } from "react";
import Svg, { Circle, Rect } from "react-native-svg";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size: number;
  color?: string;
  backgroundColor?: string;
}

const FINDER_SIZE = 7;

function getMatrix(value: string): boolean[][] | null {
  try {
    const qr = QRCodeLib.create(value, { errorCorrectionLevel: "H" });
    const { data, size } = qr.modules;
    const matrix: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      matrix[r] = [];
      for (let c = 0; c < size; c++) {
        matrix[r][c] = data[r * size + c] === 1;
      }
    }
    return matrix;
  } catch {
    return null;
  }
}

function isFinderModule(row: number, col: number, size: number): boolean {
  return (
    (row < FINDER_SIZE + 1 && col < FINDER_SIZE + 1) ||
    (row < FINDER_SIZE + 1 && col >= size - FINDER_SIZE - 1) ||
    (row >= size - FINDER_SIZE - 1 && col < FINDER_SIZE + 1)
  );
}

function FinderPattern({
  x,
  y,
  moduleSize,
  color,
  bg,
}: {
  x: number;
  y: number;
  moduleSize: number;
  color: string;
  bg: string;
}) {
  const outer = FINDER_SIZE * moduleSize;
  const mid = 5 * moduleSize;
  const inner = 3 * moduleSize;
  const innerOffset = 2 * moduleSize;
  const r = moduleSize * 1.5;

  return (
    <>
      <Rect x={x} y={y} width={outer} height={outer} rx={r} ry={r} fill={color} />
      <Rect
        x={x + moduleSize}
        y={y + moduleSize}
        width={mid}
        height={mid}
        rx={r * 0.7}
        ry={r * 0.7}
        fill={bg}
      />
      <Rect
        x={x + innerOffset}
        y={y + innerOffset}
        width={inner}
        height={inner}
        rx={r * 0.5}
        ry={r * 0.5}
        fill={color}
      />
    </>
  );
}

 function QRCode({
  value,
  size,
  color = "#000",
  backgroundColor = "transparent",
}: QRCodeProps) {
  const matrix = useMemo(() => getMatrix(value), [value]);

  if (!matrix) return null;

  const modules = matrix.length;
  const moduleSize = size / modules;
  const dotRadius = moduleSize * 0.45;

  return (
    <Svg width={size} height={size}>
      <Rect x={0} y={0} width={size} height={size} fill={backgroundColor} />

      {matrix.map((row, r) =>
        row.map((on, c) => {
          if (!on || isFinderModule(r, c, modules)) return null;
          return (
            <Circle
              key={`${r}-${c}`}
              cx={c * moduleSize + moduleSize / 2}
              cy={r * moduleSize + moduleSize / 2}
              r={dotRadius}
              fill={color}
            />
          );
        })
      )}

      <FinderPattern x={0} y={0} moduleSize={moduleSize} color={color} bg={backgroundColor} />
      <FinderPattern
        x={(modules - FINDER_SIZE) * moduleSize}
        y={0}
        moduleSize={moduleSize}
        color={color}
        bg={backgroundColor}
      />
      <FinderPattern
        x={0}
        y={(modules - FINDER_SIZE) * moduleSize}
        moduleSize={moduleSize}
        color={color}
        bg={backgroundColor}
      />
    </Svg>
  );
}

export default memo(QRCode)
