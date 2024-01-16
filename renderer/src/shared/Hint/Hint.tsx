import clsx from "clsx";
import { ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { computePosition } from "@floating-ui/dom";
import { ButtonTransparent } from "@/shared/ButtonTransparent";
import { XMarkIcon } from "@heroicons/react/24/solid";

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
  learningMethod: "buttonClick" | "nextClick" | "ctrlArrowNumberPress";
  order: number;
  groupName: string;
  children: ReactNode;
  refetenceID: string;
  shiftY: number;
  shiftX: number;
  width: "small" | "medium" | "large";
  position: Position;
};

export default function Hint({
  learningMethod,
  order,
  groupName,
  children,
  refetenceID,
  shiftY,
  shiftX,
  width,
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
  const [hintPositioning, setHintPositioning] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const group = document.querySelectorAll(`.${groupName}`);

  useEffect(() => {
    const positioningTimer = setTimeout(() => {
      setHintPositioning(true);
    }, 0);

    return () => {
      clearTimeout(positioningTimer);
    };
  }, []);
  const closeBtnHandler = () => {
    setShowHint(false);
  };

  const handleKeyDown = (e) => {
    if (
      (e.ctrlKey && e.key === "ArrowUp") ||
      (e.key === "Meta" && e.key === "ArrowUp") ||
      ((e.ctrlKey || e.key === "Control" || e.key === "Meta") &&
        /^[0-9]$/.test(e.key))
    ) {
    }
  };

  if (reference && SVG && hintPositioning) {
    const hintHeight = floating.offsetHeight;
    const hintWidth = floating.offsetWidth;

    switch (learningMethod) {
      case "buttonClick":
        reference.addEventListener("click", () => {
          setShowHint(false);
        });
        break;
      case "ctrlArrowNumberPress":
        window.addEventListener("keydown", handleKeyDown);
        break;
    }

    computePosition(reference, floating, {
      placement: position.basePosition,
    })
      .then(({ x, y }) => {
        if (showHint) {
          Object.assign(reference.style, {
            "z-index": "40",
            position: "relative",
          });
        } else {
          Object.assign(reference.style, {
            "z-index": "0",
            position: "relative",
          });
        }
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
              VerticalLine.setAttribute("y1", `${y - shiftY - hintHeight / 2}`);
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
              VerticalLine.setAttribute("y1", `${y - shiftY - hintHeight / 2}`);
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

          default:
            setShowHint(false);
        }
      })
      .catch((error) => {
        console.error("Error in computing position:", error);
      });
  }

  return (
    <>
      {showHint && (
        <>
          {createPortal(
            <div
              onClick={() => console.log("sdfghjk")}
              className="h-screen w-full fixed justify-center top-0 z-20 items-center bg-gray-900/40 pointer-events-auto"
            />,
            document.body
          )}
          {createPortal(
            <svg
              className={clsx(
                "absolute w-2/5 h-screen z-40 pointer-events-none",
                { "w-3/5 lg:w-2/5": width === "small" },
                { "w-3/5 lg:w-3/5": width === "medium" },
                { "w-4/5 lg:w-3/5": width === "large" }
              )}
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
              className={clsx(
                "p-4 flex gap-2 flex-col text-sm rounded-lg  z-50 border border-gray-500 bg-black absolute text-gray-900 dark:text-dark-heading",
                { "w-1/3 lg:w-1/5": width === "small" },
                { "w-2/5 lg:w-1/4": width === "medium" },
                { "w-3/5 lg:w-2/5": width === "large" }
              )}
              id={floatingID}
            >
              <p className={groupName}>{children}</p>
              <div className="flex gap-4 justify-end">
                <ButtonTransparent callback={() => {}}>
                  Skip all
                </ButtonTransparent>
                {order < group.length && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
                  >
                    Next
                  </button>
                )}
                {order === group.length && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <XMarkIcon
                className="w-6 h-6 fill-gray-600 dark:fill-gray-400/70 absolute right-1 top-1 cursor-pointer"
                onClick={closeBtnHandler}
              />
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}
