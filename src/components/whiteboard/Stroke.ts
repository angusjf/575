import humps from "humps";

export type Stroke = {
  attributes: Record<string, string | number>;
  type: string;
};

export const convertStrokesToSvg = (
  strokes: Stroke[],
  layout: { width: number; height: number }
): string => {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${
    layout.height
  }" version="1.1">
      <g>
        ${strokes
          .map((e) => {
            return `<${e.type.toLowerCase()} ${Object.keys(e.attributes)
              .map((a) => {
                return `${humps.decamelize(a, { separator: "-" })}="${
                  e.attributes[a]
                }"`;
              })
              .join(" ")}/>`;
          })
          .join("\n")}
      </g>
    </svg>
  `;
};
