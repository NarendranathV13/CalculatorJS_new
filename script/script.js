const disp = document.getElementById("result");
const eql = document.getElementById("equalto");
const operators = {
  "+": (a, b) => {
    return a + b;
  },
  "-": (a, b) => {
    return a - b;
  },
  "*": (a, b) => {
    return a * b;
  },
  "/": (a, b) => {
    return a / b;
  },
  "%": (a, b) => {
    return a % b;
  },
  "√": (a, b) => {
    return a * Math.sqrt(b);
  },
  "²": (a) => {
    let pwr = a;
    for (i = 1; i < 2; i++) {
      pwr *= a;
    }
    return pwr;
  },
};
const sqrt = (indexOprt, values) => {
  let preIndexDiv = indexOprt - 1;
  let nextIndexDiv = indexOprt + 1;
  let oprt = values[indexOprt];
  let subNum = parseFloat(values[nextIndexDiv]);
  let subValue = parseFloat(values[preIndexDiv]);
  if (isNaN(subValue)) {
    subValue = "1";
    values.splice(indexOprt, 0, subValue.toString());
  } else if (!isNaN(subValue)) {
    subValue = operators[oprt](subValue, subNum);
    values.splice(preIndexDiv, 3, subValue.toString());
    return values;
  }
};
const assign = (indexOprt, values) => {
  let oprt = values[indexOprt];
  if (oprt == "²") {
    let preIndexDiv = indexOprt - 1;
    let subValue = parseFloat(values[preIndexDiv]);
    subValue = operators[oprt](subValue);
    const resultValue = subValue.toString();
    values.splice(preIndexDiv, 2, resultValue);
    const subValueIndex = values.indexOf(resultValue);
    return { subValueIndex, values };
  } else {
    let preIndexDiv = indexOprt - 1;
    let nextIndexDiv = indexOprt + 1;
    let subNum = parseFloat(values[nextIndexDiv]);
    let subValue = parseFloat(values[preIndexDiv]);
    subValue = operators[oprt](subValue, subNum);
    values.splice(preIndexDiv, 3, subValue.toString());
    return values;
  }
};
let previousVal = "";
const display = (val) => {
  const inputs = disp.value;
  const regex = /([+\-*²()/%]|[\u221A])/g;
  let values = inputs.split(regex).filter(Boolean);
  if (inputs === "" && val == ".") {
    disp.value = "0";
    previousVal = val;
    disp.value += val;
  } else if (inputs === "" && /[%+*.²/]/.test(val)) {
    disp.value = "";
  } else if (/[%+\-*./]|[\u221A]/.test(previousVal) && /[%+\-*.²/]/.test(val)) {
    //avoid operators if the previous and current value are both operators
    return;
  } else if (val === "." && values[values.length - 1].includes(".")) {
    return;
  } else {
    previousVal = val;
    disp.value += val;
  }
};
const clearAll = () => {
  disp.value = "";
};
const deleteValue = () => {
  disp.value = disp.value.slice(0, -1);
};
const calculate = (inp) => {
  let inputs = inp;
  if (inputs.trim().startsWith("-√")) {
    inputs = "0" + inputs;
  }
  const regex = /(\d+\.?\d*|[+\-*/()%]|√|²)/g;
  let values = inputs.match(regex);
  let result = [];
  let currentNumber = "";
  const handleMinus = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === "-" && (i === 0 || operators.hasOwnProperty(arr[i - 1]) && arr[i-1]!="²")) {
        arr.splice(i, 2, (-parseFloat(arr[i + 1])).toString());
      }
    }
    return arr;
  };
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== "") {
      if (regex.test(value)) {
        if (currentNumber !== "") {
          result.push(currentNumber);
          currentNumber = "";
        }
        result.push(value);
      } else {
        currentNumber += value;
      }
    }
  }
  if (currentNumber !== "") {
    result.push(currentNumber);
  }
  let arr = handleMinus(result);
  return arr;
};
const splitters = async (input) => {
  let inp = input;
  const arry = await calculate(inp);
  if (arry.includes("(") && arry.includes(")")) {
    let final;
    let startIndex = arry.lastIndexOf("(");
    while (startIndex !== -1 && arry.lastIndexOf(")") !== -1) {
      let arr = [];
      let endIndex = arry.indexOf(")", startIndex);
      for (let i = startIndex + 1; i < endIndex; i++) {
        arr.push(arry[i]);
      }
      // Calculate the inner bracketed expression by finalOut
      final = await finalOut(arr);
      if (startIndex > 0 && !/[+\-*/()%√]/.test(arry[startIndex - 1])) {
        arry.splice(startIndex, 0, "*");
        startIndex++;
        endIndex++;
      }else if(startIndex > 0 && arry[startIndex - 1]=== "²"){
        arry.splice(startIndex - 1, 1);
        startIndex++;
        endIndex++;
      }
      if (
        endIndex < arry.length - 1 &&
        !/[+\-*/()%√]/.test(arry[endIndex + 1]) &&
        arry[endIndex + 1] !== "²"
      ) {
        arry.splice(endIndex + 1, 0, "*");
      }
      // Replace inner bracketed exp with its calculated value
      arry.splice(startIndex, endIndex - startIndex + 1, final.toString());
      // Update startIndex to find the next inner (
      startIndex = arry.lastIndexOf("(");
    }
    return await finalOut(arry);
  } else {
    return await finalOut(arry);
  }
};
const finalOut = (inputArray) => {
  return Promise.resolve(inputArray)
  .then((values) => {
    let rs1;
    let lp = 0;
    let subValueIndex; // Declare subValueIndex here to use it later
    if (values.includes("²")) {
      while (values.lastIndexOf("²") !== -1) {
        let powr = values.indexOf("²");
        lp += 1;
        if (lp <= 3) {
          const result = assign(powr, values);
          rs1 = result.values;
          subValueIndex = result.subValueIndex; // Assign the subValueIndex here
        } else {
          break;
        }
      }
    }
    if (lp === 3) {
     let sq= rs1[subValueIndex];
     sq*=sq;
     rs1.splice(subValueIndex,1,sq.toString()) 
    }
    return rs1 || values;
  })
    .then((values) => {
      let rs1;
      if (values.includes("√")) {
        while (values.lastIndexOf("√") !== -1) {
          let sqrtIndex = values.lastIndexOf("√");
          rs1 = sqrt(sqrtIndex, values);
        }
      }
      return rs1 || values;
    })
    .then((values) => {
      let rs1;
      if (values.includes("/")) {
        while (values.lastIndexOf("/") !== -1) {
          let divide = values.lastIndexOf("/");
          rs1 = assign(divide, values);
        }
      }
      return rs1 || values;
    })
    .then((values) => {
      let rs1;
      if (values.includes("%")) {
        while (values.lastIndexOf("%") !== -1) {
          let mod = values.lastIndexOf("%");
          rs1 = assign(mod, values);
        }
      }
      return rs1 || values;
    })
    .then((values) => {
      let rs1;
      if (values.includes("*")) {
        while (values.lastIndexOf("*") !== -1) {
          let multi = values.lastIndexOf("*");
          rs1 = assign(multi, values);
        }
      }
      return rs1 || values;
    })
    .then((values) => {
      let rs1;
      if (values.includes("-")) {
        while (values.lastIndexOf("-") !== -1) {
          let sub = values.lastIndexOf("-");
          rs1 = assign(sub, values);
        }
      }
      return rs1 || values;
    })
    .then((values) => {
      let rs1;
      if (values.includes("+")) {
        while (values.lastIndexOf("+") !== -1) {
          let add = values.lastIndexOf("+");
          rs1 = assign(add, values);
        }
      }
      return rs1 || values;
    })
    .then((res) => {
      if (/[²]/.test(res)) {
        disp.value = "overflow error";
      } else if (isNaN(res)) {
        disp.value = "Malformed expression";
      } else if (res == "") {
        disp.value = "no expression";
      } else {
        const result = parseFloat(res);
        disp.value = Number.isInteger(result) ? result : result.toFixed(6);
        return disp.value;
      }
    });
};
eql.addEventListener("click", () => {
  let input = disp.value;
  input = splitters(input);
});
let previousKey = "";
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (previousKey === key && /[%+\-*.^/]/.test(key)) {
    event.preventDefault();
  } else {
    previousKey = key;
  }
  if (!key.startsWith("F") && !key.startsWith("f")) {
    if (/([0-9+\-*^.()/%]|[\u221A])/g.test(key)) {
      display(key);
    } else if (key === "Backspace") {
      deleteValue(key);
    } else if (key === "Enter") {
      let input = disp.value;
      input = splitters(input);
    } else if (key === "Escape") {
      clearAll();
    }
  }
});