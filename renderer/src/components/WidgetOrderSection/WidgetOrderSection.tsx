import { useEffect, useState } from "react";
import { LOCAL_STORAGE_VARIABLES } from "@/helpers/contstants";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const WidgetOrderSection = () => {
  const sectionsOptions = JSON.parse(localStorage.getItem("sectionsOptions"))
    ? JSON.parse(localStorage.getItem("sectionsOptions"))
    : [
        { id: "Date Selector", side: "left", order: 1 },
        { id: "Activities Table", side: "left", order: 2 },
        { id: "Calendar", side: "left", order: 3 },
        { id: "Manual InputForm", side: "right", order: 1 },
        { id: "Totals", side: "right", order: 2 },
        { id: "Bookings", side: "right", order: 3 },
        { id: "Update Description", side: "right", order: 4 },
      ];

  const [leftSections, setLeftSections] = useState(sectionsOptions.filter((section) => section.side === "left"));
  const [rightSections, setRightSections] = useState(sectionsOptions.filter((section) => section.side === "right"));

  const handleOnDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const draggedSection = result.draggableId;

    if (result.source.droppableId !== result.destination.droppableId) {
      const newLeftSections = leftSections;
      const newRightSections = rightSections;

      if (result.destination.droppableId === "right") {
        const draggedItem = leftSections.find((section) => section.id === draggedSection);
        draggedItem.side = "right";
        newRightSections.splice(destinationIndex, 0, draggedItem);
        newLeftSections.splice(sourceIndex, 1);
      } else {
        const draggedItem = rightSections.find((section) => section.id === draggedSection);
        draggedItem.side = "left";
        newLeftSections.splice(destinationIndex, 0, draggedItem);
        newRightSections.splice(sourceIndex, 1);
      }

      setLeftSections(
        newLeftSections.map((item, i) => {
          item.order = i + 1;
          return item;
        }),
      );
      setRightSections(
        newRightSections.map((item, i) => {
          item.order = i + 1;
          return item;
        }),
      );
    } else {
      const updatedSections = result.source.droppableId === "left" ? [...leftSections] : [...rightSections];
      const [draggedItem] = updatedSections.splice(sourceIndex, 1);
      updatedSections.splice(destinationIndex, 0, draggedItem);

      if (result.source.droppableId === "left") {
        setLeftSections(
          updatedSections.map((item, i) => {
            item.order = i + 1;
            return item;
          }),
        );
      } else {
        setRightSections(
          updatedSections.map((item, i) => {
            item.order = i + 1;
            return item;
          }),
        );
      }
    }
  };

  useEffect(() => {
    return () => {
      localStorage.setItem("sectionsOptions", JSON.stringify([...leftSections, ...rightSections]));
    };
  }, []);

  return (
    <section className="h-full">
      <div className="overflow-y-auto bg-white sm:rounded-lg p-2 flex flex-col gap-6 dark:bg-dark-container">
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="flex gap-6">
            <Droppable droppableId="left">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 rounded-lg pb-4 border border-gray-500 dark:border-dark-form-border"
                >
                  <span className="dark:bg-dark-button-back-gray p-2 dark:text-dark-heading rounded-tl-md rounded-tr-md w-full block">
                    Left column
                  </span>
                  {leftSections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <li
                          className="bg-gray-200 flex m-4 dark:bg-dark-button-back-gray rounded pr-4 py-3 text-white"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <svg
                            className="pt-1 mr-1 fill-dark-main"
                            xmlns="http://www.w3.org/2000/svg"
                            width="22px"
                            height="22px"
                            viewBox="0 0 40 40"
                            enable-background="new 0 0 40 40"
                            xmlSpace="preserve"
                          >
                            <g>
                              <path
                                d="M20,4c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,4,20,4z M32,4c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,4,32,4z M20,16c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,16,20,16z M32,16c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,16,32,16z M20,28c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,28,20,28z M32,28c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,28,32,28z "
                              />
                            </g>
                          </svg>

                          <p>{section.id}</p>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
            <Droppable droppableId="right">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 rounded-lg pb-4 border border-gray-500 dark:border-dark-form-border"
                >
                  <span className="dark:bg-dark-button-back-gray p-2 dark:text-dark-heading rounded-tl-md rounded-tr-md w-full block">
                    Right column
                  </span>
                  {rightSections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <li
                          className="bg-gray-200 flex m-4 dark:bg-dark-button-back-gray rounded pr-4 py-3 text-white"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <svg
                            className="pt-1 mr-1 fill-dark-main"
                            xmlns="http://www.w3.org/2000/svg"
                            width="22px"
                            height="22px"
                            viewBox="0 0 40 40"
                            enable-background="new 0 0 40 40"
                            xmlSpace="preserve"
                          >
                            <g>
                              <path
                                d="M20,4c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,4,20,4z M32,4c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,4,32,4z M20,16c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,16,20,16z M32,16c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,16,32,16z M20,28c2.2,0,4,1.8,4,4s-1.8,4-4,4s-4-1.8-4-4S17.8,28,20,28z M32,28c2.2,0,4,1.8,4,4
		s-1.8,4-4,4s-4-1.8-4-4S29.8,28,32,28z "
                              />
                            </g>
                          </svg>
                          <p>{section.id}</p>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </section>
  );
};

export default WidgetOrderSection;
