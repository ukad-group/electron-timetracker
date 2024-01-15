import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { computePosition } from "@floating-ui/dom";
import ButtonTransparent from "./ButtonTransparent";

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
  position: Position;
};

export function Hint({
  children,
  refetenceID,
  shiftY,
  shiftX,
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(true);
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (reference && SVG && showHint) {
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
              left: `${x + shiftX}px`,
            });
            Object.assign(SVG.style, {
              top: `${y}px`,
              left: `${x}px`,
            });

            HorizontalLine.setAttribute("y1", `${shiftY}`);
            HorizontalLine.setAttribute("y2", `${shiftY}`);
            VerticalLine.setAttribute("y1", `${shiftY}`);
            VerticalLine.setAttribute("y2", `${floating.offsetHeight}`);

            if (position.diagonalPosition === "right") {
              HorizontalLine.setAttribute("x1", "1");
              HorizontalLine.setAttribute("x2", `${shiftX}`);
              VerticalLine.setAttribute("x1", "1");
              VerticalLine.setAttribute("x2", "1");

              Object.assign(floating.style, {
                left: `${x + shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x}px`,
              });
            }
            if (position.diagonalPosition === "left") {
              HorizontalLine.setAttribute("x1", `${shiftX * 2}`);
              HorizontalLine.setAttribute("x2", `${floating.offsetWidth}`);
              VerticalLine.setAttribute("x1", `${shiftX * 2}`);
              VerticalLine.setAttribute("x2", `${shiftX * 2}`);

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
            });

            HorizontalLine.setAttribute("x1", `${0}`);
            HorizontalLine.setAttribute(
              "x2",
              `${floating.offsetWidth / 2 + shiftX}`
            );
            HorizontalLine.setAttribute("y1", `${floating.offsetHeight / 2}`);
            HorizontalLine.setAttribute("y2", `${floating.offsetHeight / 2}`);

            VerticalLine.setAttribute(
              "x1",
              `${floating.offsetWidth / 2 + shiftX}`
            );
            VerticalLine.setAttribute(
              "x2",
              `${floating.offsetWidth / 2 + shiftX}`
            );

            if (position.diagonalPosition === "top") {
              VerticalLine.setAttribute("y1", `${y - shiftY}`);
              VerticalLine.setAttribute("y2", `${floating.offsetHeight / 2}`);
              Object.assign(floating.style, {
                top: `${y - shiftY}px`,
              });
            } else if (position.diagonalPosition === "bottom") {
              VerticalLine.setAttribute("y1", `${floating.offsetHeight / 2}`);
              VerticalLine.setAttribute(
                "y2",
                `${y - floating.offsetHeight + shiftY}`
              );
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
            VerticalLine.setAttribute("y2", `${shiftY + 30}`);
            HorizontalLine.setAttribute("y1", `${shiftY + 30}`);
            HorizontalLine.setAttribute("y2", `${shiftY + 30}`);

            if (position.diagonalPosition === "right") {
              HorizontalLine.setAttribute("x1", "1");
              HorizontalLine.setAttribute("x2", `${shiftX}`);
              VerticalLine.setAttribute("x1", "1");
              VerticalLine.setAttribute("x2", "1");

              Object.assign(floating.style, {
                left: `${x + shiftX}px`,
              });
              Object.assign(SVG.style, {
                left: `${x}px`,
              });
            } else if (position.diagonalPosition === "left") {
              HorizontalLine.setAttribute("x1", `${shiftX * 2}`);
              HorizontalLine.setAttribute("x2", `${floating.offsetWidth}`);
              VerticalLine.setAttribute("x1", `${shiftX * 2}`);
              VerticalLine.setAttribute("x2", `${shiftX * 2}`);

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

            HorizontalLine.setAttribute("x1", `${floating.offsetWidth / 2}`);
            HorizontalLine.setAttribute(
              "x2",
              `${floating.offsetWidth + shiftX}`
            );
            HorizontalLine.setAttribute("y1", `${floating.offsetHeight / 2}`);
            HorizontalLine.setAttribute("y2", `${floating.offsetHeight / 2}`);
            VerticalLine.setAttribute("x1", `${floating.offsetWidth / 2}`);
            VerticalLine.setAttribute("x2", `${floating.offsetWidth / 2}`);

            if (position.diagonalPosition === "top") {
              VerticalLine.setAttribute("y1", `${y - shiftY}`);
              VerticalLine.setAttribute("y2", `${floating.offsetHeight / 2}`);
              Object.assign(floating.style, {
                top: `${y - shiftY}px`,
              });
            } else if (position.diagonalPosition === "bottom") {
              VerticalLine.setAttribute("y1", `${floating.offsetHeight / 2}`);
              VerticalLine.setAttribute(
                "y2",
                `${y - floating.offsetHeight + shiftY}`
              );
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
        <div className="h-screen w-full fixed justify-center top-0 z-20 items-center bg-gray-900/40  pointer-events-none" />,
        document.body
      )}
      {createPortal(
        <svg
          className="absolute w-1/2 h-screen z-50 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          id={svgID}
        >
          <line id={HorizontalLineID} stroke="white" strokeWidth="1" />

          <line id={VerticalLineID} stroke="white" strokeWidth="1" />
        </svg>,
        document.body
      )}
      {createPortal(
        <div
          className="p-4 flex gap-2 flex-col text-sm rounded-lg z-40 border border-gray-500 bg-black absolute text-gray-900 dark:text-dark-heading w-1/5"
          id={floatingID}
        >
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
