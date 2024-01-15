import clsx from "clsx";
import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { computePosition } from "@floating-ui/dom";
import { ButtonTransparent } from "@/shared/ButtonTransparent";

export type Position =
  | {
      basePosition: "bottom";
      diagonalPosition: "left" | "right";
    }
  | {
      basePosition: "top";
      diagonalPosition: "left" | "right";
    }
  | {
      basePosition: "left";
      diagonalPosition: "bottom" | "top";
    }
  | {
      basePosition: "right";
      diagonalPosition: "bottom" | "top";
    };

export type Hint = {
  children: ReactNode;
  refetenceID: string;
  shiftY: number;
  shiftX: number;
  fullWidth: string;
  mobileWidth: string;
  position: Position;
};

export default function Hint({
  children,
  refetenceID,
  shiftY,
  shiftX,
  fullWidth,
  mobileWidth,
  position,
}: Hint) {
  const svgID = refetenceID + "SVG";
  const HorizontalLineID = refetenceID + "Horizontal";
  const VerticalLineID = refetenceID + "Vertical";
  const floatingID = refetenceID + "Float";

  const SVG = document.getElementById(svgID);
  const HorizontalLine = document.getElementById(HorizontalLineID);
  const VerticalLine = document.getElementById(VerticalLineID);
  const reference = document.getElementById(refetenceID);
  const floating = document.getElementById(floatingID);
  const [showHint, setShowHint] = useState(false);

  const className = `p-4 flex gap-2 flex-col text-sm rounded-lg w-${mobileWidth} lg:w-${fullWidth} z-50 border border-gray-500 bg-black absolute text-gray-900 dark:text-dark-heading`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (reference && SVG && showHint) {
    const hintHeight = floating.offsetHeight;
    const hintWidth = floating.offsetWidth;

    computePosition(reference, floating, {
      placement: position.basePosition,
    })
      .then(({ x, y }) => {
        Object.assign(reference.style, {
          "z-index": "40",
          position: "relative",
        });
        switch (position.basePosition) {
          case "top":
            Object.assign(floating.style, {
              top: `${y - shiftY}px`,
            });
            Object.assign(SVG.style, {
              top: `${y}px`,
            });

            HorizontalLine.setAttribute("y1", `${hintHeight / 2 - shiftY}`);
            HorizontalLine.setAttribute("y2", `${hintHeight / 2 - shiftY}`);
            VerticalLine.setAttribute("y1", `${hintHeight / 2 - shiftY}`);
            VerticalLine.setAttribute("y2", `${hintHeight}`);

            if (position.diagonalPosition === "right") {
              HorizontalLine.setAttribute("x1", "1");
              HorizontalLine.setAttribute("x2", `${shiftX - hintWidth / 2}`);
              VerticalLine.setAttribute("x1", "1");
              VerticalLine.setAttribute("x2", "1");

              Object.assign(floating.style, {
                left: `${x + shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x + hintWidth / 2}px`,
              });
            }
            if (position.diagonalPosition === "left") {
              HorizontalLine.setAttribute("x1", `${shiftX + hintWidth / 2}`);
              HorizontalLine.setAttribute("x2", `${hintWidth}`);
              VerticalLine.setAttribute("x1", `${shiftX + hintWidth / 2}`);
              VerticalLine.setAttribute("x2", `${shiftX + hintWidth / 2}`);

              Object.assign(floating.style, {
                left: `${x - shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x - shiftX}px`,
              });
            }
            break;

          case "right":
            Object.assign(floating.style, {
              left: `${x + shiftX}px`,
            });
            Object.assign(SVG.style, {
              top: `${y}px`,
              left: `${x}px`,
              width: `${hintWidth / 2 + shiftX + 1}`,
            });

            HorizontalLine.setAttribute("x1", `${0}`);
            HorizontalLine.setAttribute("x2", `${hintWidth / 2 + shiftX}`);
            HorizontalLine.setAttribute("y1", `${hintHeight / 2}`);
            HorizontalLine.setAttribute("y2", `${hintHeight / 2}`);

            VerticalLine.setAttribute("x1", `${hintWidth / 2 + shiftX}`);
            VerticalLine.setAttribute("x2", `${hintWidth / 2 + shiftX}`);

            if (position.diagonalPosition === "top") {
              VerticalLine.setAttribute("y1", `${y - shiftY}`);
              VerticalLine.setAttribute("y2", `${hintHeight / 2}`);
              Object.assign(floating.style, {
                top: `${y - shiftY}px`,
              });
            } else if (position.diagonalPosition === "bottom") {
              VerticalLine.setAttribute("y1", `${hintHeight / 2}`);
              VerticalLine.setAttribute("y2", `${y - hintHeight + shiftY}`);
              Object.assign(floating.style, {
                top: `${y + shiftY}px`,
              });
            }
            break;

          case "bottom":
            Object.assign(floating.style, {
              top: `${y + shiftY}px`,
            });
            Object.assign(SVG.style, {
              top: `${y}px`,
            });

            VerticalLine.setAttribute("y1", "0");
            VerticalLine.setAttribute("y2", `${shiftY + hintHeight / 2}`);
            HorizontalLine.setAttribute("y1", `${shiftY + hintHeight / 2}`);
            HorizontalLine.setAttribute("y2", `${shiftY + hintHeight / 2}`);

            if (position.diagonalPosition === "right") {
              HorizontalLine.setAttribute("x1", "1");
              HorizontalLine.setAttribute("x2", `${shiftX}`);
              VerticalLine.setAttribute("x1", "1");
              VerticalLine.setAttribute("x2", "1");

              Object.assign(floating.style, {
                left: `${x + shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x + hintWidth / 2}px`,
              });
            } else if (position.diagonalPosition === "left") {
              HorizontalLine.setAttribute("x1", `${hintWidth}`);
              HorizontalLine.setAttribute("x2", `${hintWidth / 2 + shiftX}`);
              VerticalLine.setAttribute("x1", `${hintWidth / 2 + shiftX}`);
              VerticalLine.setAttribute("x2", `${hintWidth / 2 + shiftX}`);
              Object.assign(floating.style, {
                left: `${x - shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x - shiftX}px`,
              });
            }
            break;

          case "left":
            Object.assign(floating.style, {
              left: `${x - shiftX}px`,
            });
            Object.assign(SVG.style, {
              top: `${y}px`,
              left: `${x - shiftX}px`,
            });

            HorizontalLine.setAttribute("x1", `${hintWidth / 2}`);
            HorizontalLine.setAttribute("x2", `${hintWidth + shiftX}`);
            HorizontalLine.setAttribute("y1", `${hintHeight / 2}`);
            HorizontalLine.setAttribute("y2", `${hintHeight / 2}`);
            VerticalLine.setAttribute("x1", `${hintWidth / 2}`);
            VerticalLine.setAttribute("x2", `${hintWidth / 2}`);

            if (position.diagonalPosition === "top") {
              VerticalLine.setAttribute("y1", `${y - shiftY}`);
              VerticalLine.setAttribute("y2", `${hintHeight / 2}`);
              Object.assign(floating.style, {
                top: `${y - shiftY}px`,
              });
            } else if (position.diagonalPosition === "bottom") {
              VerticalLine.setAttribute("y1", `${hintHeight / 2}`);
              VerticalLine.setAttribute("y2", `${y - hintHeight + shiftY}`);
              Object.assign(floating.style, {
                top: `${y + shiftY}px`,
              });
            }
            break;
        }
      })
      .catch((error) => {
        console.error("Error in computing position:", error);
      });
  }

  return (
    <>
      {createPortal(
        <div className="h-screen w-full fixed justify-center top-0 z-20 items-center bg-gray-900/40 pointer-events-none" />,
        document.body
      )}
      {createPortal(
        <svg
          className="absolute  h-screen z-40 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          id={svgID}
        >
          <line id={HorizontalLineID} stroke="white" strokeWidth="1" />

          <line id={VerticalLineID} stroke="white" strokeWidth="1" />
        </svg>,
        document.body
      )}
      {createPortal(
        <div className={className} id={floatingID}>
          <p>{children}</p>
          <div className="flex gap-4 justify-end">
            <ButtonTransparent callback={() => {}}>Skip all</ButtonTransparent>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
            >
              Next
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
