import clsx from "clsx";
import {
  ReactNode,
  useState,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { createPortal } from "react-dom";
import { computePosition } from "@floating-ui/dom";
import { ButtonTransparent } from "@/shared/ButtonTransparent";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useTutorialProgressStore } from "@/store/tutorialProgressStore";
import { shallow } from "zustand/shallow";

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
  displayCondition?: boolean;
  learningMethod: "buttonClick" | "nextClick" | "ctrlArrowNumberPress";
  order: number;
  groupName: string;
  children: ReactNode;
  referenceRef: MutableRefObject<any>;
  shiftY: number;
  shiftX: number;
  width: "small" | "medium" | "large";
  position: Position;
};

export default function Hint({
  displayCondition,
  learningMethod,
  order,
  groupName,
  children,
  referenceRef,
  shiftY,
  shiftX,
  width,
  position,
}: Hint) {
  const SVGRef = useRef(null);
  const HorizontalLineRef = useRef(null);
  const VerticalLineRef = useRef(null);
  const TriangleRef = useRef(null);
  const floatingRef = useRef(null);
  const [showHint, setShowHint] = useState(false);
  const [groupSize, setGroupSize] = useState(0);

  const [progress, setProgress] = useTutorialProgressStore(
    (state) => [state.progress, state.setProgress],
    shallow
  );

  const positioning = () => {
    if (referenceRef && floatingRef.current && SVGRef.current) {
      const hintHeight = floatingRef.current.offsetHeight;
      const hintWidth = floatingRef.current.offsetWidth;

      switch (learningMethod) {
        case "buttonClick":
          referenceRef.current.addEventListener("click", () => {
            hintLearned();
          });
          break;

        case "ctrlArrowNumberPress":
          window.addEventListener("keydown", handleKeyDown);
          break;
      }

      computePosition(referenceRef.current, floatingRef.current, {
        placement: position.basePosition,
      })
        .then(({ x, y }) => {
          if (showHint) {
            Object.assign(referenceRef.current.style, {
              "z-index": "40",
              position: "relative",
            });
          } else {
            Object.assign(referenceRef.current.style, {
              "z-index": "0",
              position: "relative",
            });
          }

          switch (position.basePosition) {
            case "top":
              Object.assign(floatingRef.current.style, {
                top: `${y - shiftY}px`,
              });
              Object.assign(SVGRef.current.style, {
                top: `${y}px`,
                width: `${hintWidth + shiftX}`,
              });

              HorizontalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 - shiftY}`
              );
              HorizontalLineRef.current.setAttribute(
                "y2",
                `${hintHeight / 2 - shiftY}`
              );
              VerticalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 - shiftY}`
              );
              VerticalLineRef.current.setAttribute("y2", `${hintHeight}`);

              TriangleRef.current.setAttribute(
                "points",
                `${0}, ${hintHeight - 10} 
              ${5}, ${hintHeight} 
              ${10},  ${hintHeight - 10} `
              );

              if (position.diagonalPosition === "right") {
                HorizontalLineRef.current.setAttribute("x1", "5");
                HorizontalLineRef.current.setAttribute(
                  "x2",
                  `${shiftX - hintWidth / 2}`
                );
                VerticalLineRef.current.setAttribute("x1", "5");
                VerticalLineRef.current.setAttribute("x2", "5");

                Object.assign(floatingRef.current.style, {
                  left: `${x + shiftX}px`,
                });
                Object.assign(SVGRef.current.style, {
                  left: `${x + hintWidth / 2}px`,
                });
              }
              if (position.diagonalPosition === "left") {
                HorizontalLineRef.current.setAttribute(
                  "x1",
                  `${shiftX + hintWidth / 2}`
                );
                HorizontalLineRef.current.setAttribute("x2", `${hintWidth}`);
                VerticalLineRef.current.setAttribute(
                  "x1",
                  `${shiftX + hintWidth / 2}`
                );
                VerticalLineRef.current.setAttribute(
                  "x2",
                  `${shiftX + hintWidth / 2}`
                );

                Object.assign(floatingRef.current.style, {
                  left: `${x - shiftX}px`,
                });
                Object.assign(SVGRef.current.style, {
                  left: `${x - shiftX}px`,
                });
              }
              break;

            case "right":
              Object.assign(floatingRef.current.style, {
                left: `${x + shiftX}px`,
              });
              Object.assign(SVGRef.current.style, {
                top: `${y - shiftY}px`,
                left: `${x}px`,
                width: `${hintWidth / 2 + shiftX + 1}`,
              });

              HorizontalLineRef.current.setAttribute("x1", `${0}`);
              HorizontalLineRef.current.setAttribute(
                "x2",
                `${hintWidth / 2 + shiftX}`
              );
              HorizontalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 + shiftY}`
              );
              HorizontalLineRef.current.setAttribute(
                "y2",
                `${hintHeight / 2 + shiftY}`
              );

              VerticalLineRef.current.setAttribute(
                "x1",
                `${hintWidth / 2 + shiftX}`
              );
              VerticalLineRef.current.setAttribute(
                "x2",
                `${hintWidth / 2 + shiftX}`
              );
              VerticalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 + shiftY}`
              );

              TriangleRef.current.setAttribute(
                "points",
                `${10}, ${hintHeight / 2 + shiftY - 5} 
              ${0}, ${hintHeight / 2 + shiftY} 
              ${10},  ${hintHeight / 2 + shiftY + 5} `
              );

              if (position.diagonalPosition === "top") {
                VerticalLineRef.current.setAttribute("y2", `${hintHeight}`);
                Object.assign(floatingRef.current.style, {
                  top: `${y - shiftY}px`,
                });
              } else if (position.diagonalPosition === "bottom") {
                VerticalLineRef.current.setAttribute(
                  "y2",
                  `${hintHeight / 2 + shiftY * 2}`
                );
                Object.assign(SVGRef.current.style, {
                  height: `${hintHeight + shiftY * 2}`,
                });
                Object.assign(floatingRef.current.style, {
                  top: `${y + shiftY}px`,
                });
              }
              break;

            case "bottom":
              Object.assign(floatingRef.current.style, {
                top: `${y + shiftY}px`,
              });
              Object.assign(SVGRef.current.style, {
                top: `${y}px`,
                width: `${hintWidth + shiftX}`,
              });

              VerticalLineRef.current.setAttribute("y1", "0");
              VerticalLineRef.current.setAttribute(
                "y2",
                `${shiftY + hintHeight / 2}`
              );
              HorizontalLineRef.current.setAttribute(
                "y1",
                `${shiftY + hintHeight / 2}`
              );
              HorizontalLineRef.current.setAttribute(
                "y2",
                `${shiftY + hintHeight / 2}`
              );

              if (position.diagonalPosition === "right") {
                HorizontalLineRef.current.setAttribute("x1", "5");
                HorizontalLineRef.current.setAttribute("x2", `${shiftX}`);
                VerticalLineRef.current.setAttribute("x1", "5");
                VerticalLineRef.current.setAttribute("x2", "5");

                TriangleRef.current.setAttribute(
                  "points",
                  `${0}, ${10} 
                  ${5}, ${0} 
                  ${10},  ${10} `
                );

                Object.assign(floatingRef.current.style, {
                  left: `${x + shiftX}px`,
                });
                Object.assign(SVGRef.current.style, {
                  left: `${x + hintWidth / 2}px`,
                });
              } else if (position.diagonalPosition === "left") {
                HorizontalLineRef.current.setAttribute("x1", `${hintWidth}`);
                HorizontalLineRef.current.setAttribute(
                  "x2",
                  `${hintWidth / 2 + shiftX}`
                );
                VerticalLineRef.current.setAttribute(
                  "x1",
                  `${hintWidth / 2 + shiftX}`
                );
                VerticalLineRef.current.setAttribute(
                  "x2",
                  `${hintWidth / 2 + shiftX}`
                );

                TriangleRef.current.setAttribute(
                  "points",
                  `${hintWidth / 2 + shiftX - 5}, ${10} 
                  ${hintWidth / 2 + shiftX}, ${0} 
                  ${hintWidth / 2 + shiftX + 5},  ${10} `
                );

                Object.assign(floatingRef.current.style, {
                  left: `${x - shiftX}px`,
                });
                Object.assign(SVGRef.current.style, {
                  left: `${x - shiftX}px`,
                });
              }
              break;

            case "left":
              Object.assign(floatingRef.current.style, {
                left: `${x - shiftX}px`,
              });
              Object.assign(SVGRef.current.style, {
                top: `${y - shiftY}px`,
                left: `${x - shiftX}px`,
                width: `${hintWidth + shiftX}`,
                height: `${hintHeight + shiftY}`,
              });

              HorizontalLineRef.current.setAttribute("x1", `${hintWidth / 2}`);
              HorizontalLineRef.current.setAttribute(
                "x2",
                `${hintWidth + shiftX}`
              );
              HorizontalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 + shiftY}`
              );
              HorizontalLineRef.current.setAttribute(
                "y2",
                `${hintHeight / 2 + shiftY}`
              );
              VerticalLineRef.current.setAttribute("x1", `${hintWidth / 2}`);
              VerticalLineRef.current.setAttribute("x2", `${hintWidth / 2}`);
              VerticalLineRef.current.setAttribute(
                "y1",
                `${hintHeight / 2 + shiftY}`
              );

              TriangleRef.current.setAttribute(
                "points",
                `${hintWidth + shiftX - 10}, ${hintHeight / 2 + shiftY - 5} 
              ${hintWidth + shiftX}, ${hintHeight / 2 + shiftY} 
              ${hintWidth + shiftX - 10},  ${hintHeight / 2 + shiftY + 5} `
              );

              if (position.diagonalPosition === "top") {
                VerticalLineRef.current.setAttribute("y2", `${hintHeight}`);
                Object.assign(floatingRef.current.style, {
                  top: `${y - shiftY}px`,
                });
              } else if (position.diagonalPosition === "bottom") {
                VerticalLineRef.current.setAttribute(
                  "y2",
                  `${hintHeight / 2 + shiftY * 2}`
                );
                Object.assign(SVGRef.current.style, {
                  height: `${hintHeight + shiftY * 2}`,
                });
                Object.assign(floatingRef.current.style, {
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
  };

  useEffect(() => {
    const handleResize = () => {
      positioning();
    };
    window.addEventListener("resize", handleResize);

    if (order > 1 && progress[groupName] === undefined) {
      const tempArr = [null];
      for (let i = 1; i < order; i++) {
        tempArr[i] = true;
      }
      progress[groupName] = tempArr;
      setProgress(progress);
      hintLearned();
    } else if (order > 1 && progress[groupName] !== undefined) {
      progress[groupName][order + 1] = true;
      setProgress(progress);
      hintLearned();
    }

    const unsubscribe = useTutorialProgressStore.subscribe((newProgress) => {
      newProgress[groupName]?.length
        ? setGroupSize(newProgress[groupName]?.length)
        : null;

      if (
        newProgress.progress.hasOwnProperty(groupName) &&
        !newProgress.progress[groupName][order - 1]
      ) {
        setShowHint(true);
      } else {
        setShowHint(false);
      }

      if (
        !newProgress.progress.hasOwnProperty(groupName) &&
        displayCondition &&
        newProgress.progress.hasOwnProperty(`${groupName}Conditions`) &&
        !newProgress.progress[`${groupName}Conditions`].includes(false)
      ) {
        setShowHint(true);
      } else if (
        newProgress.progress.hasOwnProperty(groupName) &&
        newProgress.progress[groupName][order - 1] !== false &&
        displayCondition &&
        newProgress.progress.hasOwnProperty(`${groupName}Conditions`) &&
        !newProgress.progress[`${groupName}Conditions`].includes(false)
      ) {
        // Without this empty condition, no hints with displayCondition property are displayed. If you know why, tell me.
      } else if (
        displayCondition &&
        newProgress.progress.hasOwnProperty(groupName) &&
        !newProgress.progress[groupName][order - 1]
      ) {
        setShowHint(false);
      }
    });

    return () => {
      unsubscribe();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    progress[groupName]?.length
      ? setGroupSize(progress[groupName]?.length)
      : null;

    if (progress.hasOwnProperty(groupName) && progress[groupName][order - 1]) {
      setShowHint(false);
    } else if (!displayCondition) {
      setShowHint(true);
    }
  }, [progress[groupName], progress[`${groupName}Conditions`]]);

  const hintLearned = () => {
    setShowHint(false);
    if (progress[groupName] === undefined) {
      progress[groupName] = [true];
    } else {
      progress[groupName][order - 1] = true;
    }
    setProgress(progress);
  };

  const closeBtnHandler = () => {
    hintLearned();
  };

  const handleKeyDown = (e) => {
    if (
      (e.ctrlKey && e.key === "ArrowUp") ||
      (e.key === "Meta" && e.key === "ArrowUp") ||
      ((e.ctrlKey || e.key === "Control" || e.key === "Meta") &&
        /^[0-9]$/.test(e.key))
    ) {
      hintLearned();
    }
  };

  const nextClickHandler = () => {
    if (progress[groupName][order] !== undefined) {
      progress[groupName][order] = false;
    }
    setProgress(progress);
    hintLearned();
  };

  useEffect(() => {
    if (!progress.skipAll[0]) {
      positioning();
    }
    if (referenceRef.current && !showHint) {
      Object.assign(referenceRef.current.style, {
        "z-index": "0",
        position: "relative",
      });
    }
  }, [showHint]);

  const skipAllClockHandler = () => {
    setShowHint(false);
    progress.skipAll[0] = true;
    setProgress(progress);
    Object.assign(referenceRef.current.style, {
      "z-index": "0",
      position: "relative",
    });
  };

  return (
    <>
      {showHint && (
        <>
          {createPortal(
            <div className="h-screen w-full fixed justify-center top-0 z-20 items-center bg-gray-900/40 pointer-events-auto" />,
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
              ref={SVGRef}
            >
              <line ref={HorizontalLineRef} stroke="white" strokeWidth="1" />

              <line ref={VerticalLineRef} stroke="white" strokeWidth="1" />

              <polygon className="z-50" ref={TriangleRef} fill="white" />
            </svg>,
            document.body
          )}
          {createPortal(
            <div
              id="hint"
              className={clsx(
                "p-4 pt-5 flex gap-2 flex-col text-sm rounded-lg  z-50 border border-gray-500 bg-black absolute text-gray-900 dark:text-dark-heading",
                { "w-1/3 lg:w-1/5": width === "small" },
                { "w-2/5 lg:w-1/4": width === "medium" },
                { "w-3/5 lg:w-2/5": width === "large" }
              )}
              ref={floatingRef}
            >
              <p className={groupName}>{children}</p>
              <div className="flex gap-4 justify-end">
                <ButtonTransparent callback={skipAllClockHandler}>
                  Skip all
                </ButtonTransparent>
                {order < groupSize && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
                    onClick={nextClickHandler}
                  >
                    Next
                  </button>
                )}
                {(!groupSize || order === groupSize) && (
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500   dark:bg-dark-button-back  dark:hover:bg-dark-button-hover"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeBtnHandler();
                    }}
                  >
                    Close
                  </button>
                )}
              </div>
              <XMarkIcon
                className="w-6 h-6 fill-gray-600 dark:fill-gray-400/70 absolute right-1 top-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeBtnHandler();
                }}
              />
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}
