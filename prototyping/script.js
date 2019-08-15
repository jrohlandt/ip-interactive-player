window.onload = function() {
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
  window.handleDragStart = function(e) {
    console.log("dragstart");

    // e.dataTransfer.setData("application/my-app", e.target.id);
    // e.dataTransfer.setData(
    //   "text/plain",
    //   JSON.stringify(e.target.getBoundingClientRect())
    // );
    e.dataTransfer.dropEffect = "move";
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#dragend
  window.handleDragEnd = function(e) {
    e.preventDefault();
    console.log(e.dataTransfer.dropEffect);
    if (e.dataTransfer.dropEffect !== "move") {
      console.log("drag cancelled");
      return;
    }

    const dimensions = this.document
      .querySelector(".main")
      .getBoundingClientRect();
    const { left, top, width, height } = dimensions;
    this.console.log(
      e.clientX,
      ((e.clientX - left) / width) * 100,
      e.screenX,
      e.screenY
    );

    e.target.style.left = `${((e.clientX - left) / width) * 100}%`;
    e.target.style.top = `${((e.clientY - top) / height) * 100}%`;
  };

  window.handleDragOver = function(e) {
    console.log("dragover");
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  window.handleDrop = function(e) {
    console.log("drop");
    e.preventDefault();
    // var data = e.dataTransfer.getData("application/my-app");
    // var other = e.dataTransfer.getData("text/plain");
    // var dot = document.getElementById(data);
    // console.log("data: ", data, other, dot);

    // var o = JSON.parse(other);
    // dot.top = o.top + "px";
  };

  let mainDiv = document.querySelector(".main");
  const dimensions = mainDiv.getBoundingClientRect();
  //   let compStyles = window.getComputedStyle(mainDiv);
  //   console.log("dd", compStyles.getPropertyValue("height"));
  const d = {
    "clientWidth: ": mainDiv.clientWidth,
    "clientHeight: ": mainDiv.clientHeight,
    "offsetWidth: ": mainDiv.offsetWidth,
    "offsetHeight: ": mainDiv.offsetHeight,
    "scrollWidth: ": mainDiv.scrollWidth,
    "scrollHeight: ": mainDiv.scrollHeight
  };
  console.log(d, dimensions);

  const referenceData = {
    width: 523,
    height: 348,
    left: 135,
    top: 160
  };

  const r = referenceData;

  console.log("rrr: ", (r.left / r.width) * 100, (r.top / r.height) * 100);
  let dot = document.querySelector("#tail1");
  dot.style.top = "46%";
  dot.style.left = "26%";

  mainDiv.addEventListener("click", e => {
    const { left, top, width, height } = dimensions;
    // console.log(width, height);
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    console.log(x, y, e.screenX);

    dot.style.top = `${y}%`;
    dot.style.left = `${x}%`;
  });
};
