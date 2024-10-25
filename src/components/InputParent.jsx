import React, { useState, useCallback } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import { FaClipboardCheck } from "react-icons/fa6";
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const createNewInput = (value = "", parentValue = "") => ({
  id: Math.random().toString(),
  value,
  parentValue,
  children: [],
  isCopy: false,
  copyCount: 1,
});

const ItemTypes = {
  INPUT: 'input'
};

const DraggableInput = ({ input, index, moveInput, level, ...props }) => {
  const [, drag] = useDrag({
    type: ItemTypes.INPUT,
    item: { id: input.id, index, level },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.INPUT,
    hover: (draggedItem) => {
      if (draggedItem.id !== input.id) {
        moveInput(draggedItem.id, input.id);
      }
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className="w-full" style={{
      position: "relative",
      border: input.isCopy && level === 0 ? "2px dashed " : "none",
      borderRadius: input.isCopy && level === 0 ? "8px" : "0",
      padding: input.isCopy && level === 0 ? "10px" : "0",
    }}>
      {input.isCopy && level === 0 && (
        <>
          <span
            style={{
              position: "absolute",
              top: "-15px",
              right: "10px",
              backgroundColor: "#FF33A1",
              color: "#FFF",
              padding: "8px",
              borderRadius: "5px",
              fontSize: "20px",
            }}
          >
            <FaClipboardCheck />
          </span>
          <span
            style={{
              position: "absolute",
              top: "-17px",
              right: "0px",
              backgroundColor: "black",
              color: "#FFF",
              padding: "4px 8px",
              borderRadius: "10px",
              fontSize: "10px",
            }}
          >
            {input.copyCount}
          </span>
        </>
      )}
      <div
        className="p-3 w-full flex gap-3 justify-between items-center border-[#EBD3F8] border-4 rounded-2xl"
        style={{ marginLeft: `${level * 10}px`, marginBottom: "10px" }}
      >
        <input
          type="text"
          value={input.value}
          onChange={(event) => props.handleInputChange(input.id, event)}
          placeholder={
            input.parentValue
              ? `${input.parentValue} -> New Child`
              : "New Parent"
          }
          className="placeholder-zinc-700 text-gray-950 font-bold text-xl h-14 rounded-lg border-4 bg-transparent outline-none px-2 border-[#2E073F]"
          style={{ width: `calc(100% - ${level * 10}px)` }}
        />
        <button
          onClick={() => props.addNewInput(input.id, input.value)}
          className="border-4 text-[#7A1CAC] py-2 hover:bg-purple-500 px-3 rounded-lg font-bold"
        >
          Add
        </button>
        <button
          onClick={() => props.handleUpdateInput(input.id, input.value)}
          className="border-4 text-[#7A1CAC] py-2 hover:bg-purple-500 px-3 rounded-lg font-bold"
        >
          Update
        </button>
        <button
          onClick={() => props.handleCopyInput(input.id)}
          className="border-4 text-[#7A1CAC] py-2 hover:bg-purple-500 px-3 rounded-lg font-bold"
        >
          Copy
        </button>
        <button
          onClick={() => props.handleDeleteInput(input.id)}
          className="border-4 text-[#7A1CAC] py-2 hover:bg-purple-500 px-3 rounded-lg font-bold"
        >
          <FaRegTrashAlt className="text-2xl" />
        </button>
      </div>
      {input.children && input.children.length > 0 && (
        <div className="ml-8 text-gray-950">
          {props.renderInputs(input.children, level + 1)}
        </div>
      )}
    </div>
  );
};

const InputParent = () => {
  const [inputs, setInputs] = useState([createNewInput()]);

  const copyInput = (input) => {
    return {
      ...input,
      id: Math.random().toString(),
      isCopy: true,
      children: input.children.map((child) => copyInput(child)),
    };
  };

  const handleInputChange = (id, event) => {
    const updateInputs = (inputsList) =>
      inputsList.map((input) => {
        if (input.id === id) {
          return { ...input, value: event.target.value };
        } else if (input.children.length > 0) {
          return { ...input, children: updateInputs(input.children) };
        }
        return input;
      });
    setInputs(updateInputs(inputs));
  };

  const handleUpdateInput = (id, newValue) => {
    const updateInputs = (inputsList) =>
      inputsList.map((input) => {
        if (input.id === id || input.isCopy) {
          return { ...input, value: newValue };
        } else if (input.children.length > 0) {
          return { ...input, children: updateInputs(input.children) };
        }
        return input;
      });
    setInputs(updateInputs(inputs));
  };

  const addNewInput = (parentId, parentValue) => {
    const updateInputs = (inputsList) =>
      inputsList.map((input) => {
        if (input.id === parentId) {
          return {
            ...input,
            children: [...input.children, createNewInput("", input.value)],
          };
        } else if (input.children.length > 0) {
          return { ...input, children: updateInputs(input.children) };
        }
        return input;
      });
    setInputs(updateInputs(inputs));
  };

  const handleCopyInput = (inputId) => {
    const updateInputs = (inputsList) => {
      return inputsList.map((input) => {
        if (input.id === inputId) {
          const copiedInput = copyInput(input);
          input.copyCount += 1; 
          return [input, copiedInput]; 
        } else if (input.children.length > 0) {
          return { ...input, children: updateInputs(input.children) };
        }
        return input;
      }).flat(); // Flatten the array to avoid nested arrays
    };
    setInputs(updateInputs(inputs));
  };

  const handleDeleteInput = (inputId) => {
    if (inputId === inputs[0].id) {
      alert("You cannot delete the root input!");
      return;
    }
    const updateInputs = (inputsList) =>
      inputsList
        .filter((input) => input.id !== inputId)
        .map((input) => ({
          ...input,
          children: updateInputs(input.children),
        }));
    setInputs(updateInputs(inputs));
  };

  const moveInput = useCallback((draggedId, hoveredId) => {
    setInputs((prevInputs) => {
      const flattenInputs = (items, parentId = null, level = 0) => 
        items.reduce((acc, item) => [
          ...acc,
          { ...item, parentId, level },
          ...flattenInputs(item.children, item.id, level + 1)
        ], []);

      const rebuildTree = (flatList) => {
        const idToChildren = {};
        flatList.forEach(item => {
          if (!idToChildren[item.parentId]) {
            idToChildren[item.parentId] = [];
          }
          idToChildren[item.parentId].push({ ...item, children: [] });
        });

        const addChildren = (item) => {
          if (idToChildren[item.id]) {
            item.children = idToChildren[item.id].map(addChildren);
          }
          return item;
        };

        return idToChildren[null].map(addChildren);
      };

      const flat = flattenInputs(prevInputs);
      const draggedItemWithChildren = flat.filter(item => 
        item.id === draggedId || 
        flat.some(parent => parent.id === draggedId && item.parentId === parent.id)
      );
      const otherItems = flat.filter(item => !draggedItemWithChildren.some(draggedItem => draggedItem.id === item.id));

      const hoveredIndex = otherItems.findIndex(item => item.id === hoveredId);
      const newFlat = [
        ...otherItems.slice(0, hoveredIndex),
        ...draggedItemWithChildren,
        ...otherItems.slice(hoveredIndex)
      ];

      return rebuildTree(newFlat);
    });
  }, []);

  const renderInputs = (inputsList, level = 0) => {
    return inputsList.map((input, index) => (
      <DraggableInput
        key={input.id}
        input={input}
        index={index}
        moveInput={moveInput}
        level={level}
        handleInputChange={handleInputChange}
        addNewInput={addNewInput}
        handleUpdateInput={handleUpdateInput}
        handleCopyInput={handleCopyInput}
        handleDeleteInput={handleDeleteInput}
        renderInputs={renderInputs}
      />
    ));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col gap-4 max-w-[1400px] m-auto">
        {renderInputs(inputs)}
      </div>
    </DndProvider>
  );
};

export default InputParent;
