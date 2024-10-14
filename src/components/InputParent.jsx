import React, { useState } from "react";
import toast from "react-hot-toast";
import { FcAcceptDatabase } from "react-icons/fc";
import { FaRegTrashAlt } from "react-icons/fa";

const createNewInput = (value = "", parentValue = "") => ({
  id: Math.random(),
  value,
  parentValue,
  children: [],
});

const InputParent = () => {
  const [inputs, setInputs] = useState([createNewInput()]);

  const copyInput = (input) => {
    return {
      ...input,
      id: Math.random(),
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

  const addNewInput = (parentId, value) => {
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
      let newInputsList = [...inputsList];
      const findAndCopyInput = (list) => {
        return list.flatMap((input) => {
          if (input.id === inputId) {
            const copiedInput = copyInput(input);
            return [input, copiedInput];
          } else if (input.children.length > 0) {
            return {
              ...input,
              children: findAndCopyInput(input.children),
            };
          }
          return input;
        });
      };
  
      newInputsList = findAndCopyInput(newInputsList);
      return newInputsList;
    };
  
    setInputs(updateInputs(inputs));
    
    // نمایش پیام toast
    toast("کپی شد!", {
      icon: <FcAcceptDatabase />, // اگر از آیکون استفاده می‌کنید
    });
  };
  

  const handleDeleteInput = (inputId, isParent) => {
    const updateInputs = (inputsList) =>
      inputsList
        .filter((input) => input.id !== inputId)
        .map((input) => {
          if (input.children.length > 0) {
            return { ...input, children: updateInputs(input.children) };
          }
          return input;
        });

    if (isParent) {
      setInputs(updateInputs(inputs));
    } else {
      const removeChild = (inputsList) =>
        inputsList.map((input) => {
          return {
            ...input,
            children: input.children.filter((child) => child.id !== inputId),
          };
        });

      setInputs(removeChild(inputs));

      
    }
  };

  //   const copyInputValues = (input) => {
  //     const valuesToCopy = [input.value];

  //     if (input.children.length > 0) {
  //       const childrenValues = input.children.map((child) => child.value);
  //       valuesToCopy.push(...childrenValues);
  //     }

  //     const textToCopy = valuesToCopy.join(", ");

  //     navigator.clipboard
  //       .writeText(textToCopy)
  //       .then(() => {
  //         toast("کپی شد", {
  //           icon: <FcAcceptDatabase />,
  //         });
  //       })
  //       .catch((err) => {
  //         toast.error("خطا در کپی!");
  //       });
  //   };

  const renderInputs = (inputsList, level = 0) => {
    return inputsList.map((input) => (
      <div key={input.id} className="w-full">
        <div className="p-3 w-full flex gap-3 justify-between items-center border-[#ab6d90] border-2 rounded-2xl my-2">
          <input
            type="text"
            value={input.value}
            placeholder={
              input.parentValue
                ? `${input.parentValue} -> New Child`
                : "New Parent"
            }
            onChange={(event) => handleInputChange(input.id, event)}
            className="w-[90%] text-[#493628] placeholder:text-[#4928467b] font-bold text-xl h-14 rounded-lg border-2 bg-transparent outline-none px-2 border-[#6b3a53]"
          />

          <button
            onClick={() => addNewInput(input.id, input.value)}
            className="border-2 text-[#492846] hover:bg-[#492846] hover:text-white transition-all px-3 rounded-lg"
          >
            Add
          </button>
          <button
            onClick={() => handleCopyInput(input.id)}
            className="border-2 text-[#492846] hover:bg-[#492846] hover:text-white transition-all px-3 rounded-lg"
          >
            Copy
          </button>

          <button
            onClick={() =>
              handleDeleteInput(input.id, input.children.length > 0)
            }
            className="border-2 text-[#492846] hover:bg-[#492846] transition-all hover:text-white px-3 py-1 rounded-lg "
          > <FaRegTrashAlt />
          </button>
        </div>

        {input.children.length > 0 && (
          <div className="ml-8">{renderInputs(input.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-4 w-[90%] m-auto">
      {renderInputs(inputs)}
    </div>
  );
};

export default InputParent;
