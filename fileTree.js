class Node {
  constructor(fileName, parentId = null, icon = "doc") {
    this.id = Date.now();
    this.fileName = fileName;
    this.parentId = parentId;
    this.icon = icon;
  }
}

// TODO: to add draggable and dragover feature.

class App {
  constructor(rootSelector) {
    this.root = document.getElementById(rootSelector);
    this.addDragOver(this.root);
    this.closestEl = null;
    this.fileIcons = new Set([
      "html",
      "css",
      "js",
      "png",
      "py",
      "ts",
      "txt",
      "folder",
      "doc",
    ]);

    this.db = this.getLocalStorage();
    this.render();
  }

  setLocalStorage() {
    localStorage.setItem("files", JSON.stringify(this.db));
  }

  getLocalStorage() {
    return localStorage.getItem("files")
      ? JSON.parse(localStorage.getItem("files"))
      : [
          {
            id: 1,
            fileName: "Folder 1",
            parentId: null,
            icon: "folder",
          },
          {
            id: 2,
            fileName: "index.html",
            parentId: 1,
            icon: "html",
          },
          {
            id: 3,
            fileName: "style.css",
            parentId: 1,
            icon: "css",
          },
          {
            id: 4,
            fileName: "Nested Folder",
            parentId: 1,
            icon: "folder",
          },
          {
            id: 5,
            fileName: "script.js",
            parentId: 4,
            icon: "js",
          },
          {
            id: 6,
            fileName: "Folder 2",
            parentId: null,
            icon: "folder",
          },
          {
            id: 7,
            fileName: "Python.py",
            parentId: 4,
            icon: "py",
          },
          {
            id: 8,
            fileName: "Python.py",
            parentId: 6,
            icon: "py",
          },
          {
            id: 9,
            fileName: "Folder 5",
            parentId: 4,
            icon: "folder",
          },
        ];
  }

  createFolderOrFileNode(value, parentId = null, type) {
    let node;
    if (type === "folder") {
      node = new Node(value, parentId, type);
    } else {
      const fileTypes = value.split(".");
      if (fileTypes.length > 1 && this.fileIcons.has(fileTypes[1])) {
        node = new Node(value, parentId, fileTypes[1]);
      } else {
        node = new Node(value, parentId);
      }
    }
    this.db.push(node);
    this.setLocalStorage();
    this.render();
  }

  getFiles(parentId) {
    return this.db.filter((e) => e.parentId === parentId);
  }

  getRootDatas() {
    return this.db.filter((e) => e.parentId === null);
  }

  addDraggable(el) {
    if (el) {
      el.addEventListener("dragstart", (e) => {
        el.classList.add("is-dragging");
      });

      el.addEventListener("dragend", (e) => {
        el.classList.remove("is-dragging");

        const nextNodeId = Number(this.closestEl.id);

        this.db.forEach((node) => {
          if (node.id === Number(el.id)) {
            node.parentId = nextNodeId;
          }
        });

        this.setLocalStorage();
        this.render();
      });
    }
  }

  addDragOver(FolderDiv) {
    FolderDiv.addEventListener("dragover", (e) => {
      e.preventDefault();
      const fileEl = document.querySelector(".is-dragging");
      this.closestEl = this.getClosestElement(FolderDiv, e.clientY);
      

      if (this.closestEl) {
        FolderDiv.insertBefore(fileEl, this.closestEl);
      } else {
        FolderDiv.appendChild(fileEl);
      }
    });
  }

  getClosestElement(FolderDiv, yAxis) {
    const files = FolderDiv.querySelectorAll(
      ".folder-container:not(.is-dragging)"
    );

    let closestEl = null;
    let closestDistance = Number.NEGATIVE_INFINITY;

    files.forEach((file) => {
      const boundry = file.getBoundingClientRect();
      const bottom = boundry.bottom;

      const distance = yAxis - bottom;

      if (distance < 0 && distance > closestDistance) {
        closestDistance = distance;
        closestEl = file;
      }
    });
    return closestEl;
  }

  createFile(file) {
    const fileInfo = document.createElement("div");
    fileInfo.classList.add("file-info", "folder");
    fileInfo.setAttribute("draggable", "true");

    const fileNameImgDiv = document.createElement("div");
    fileNameImgDiv.classList.add("file-name-img");
    fileInfo.appendChild(fileNameImgDiv);

    const fileImg = document.createElement("img");
    fileImg.classList.add("file-icon-png");
    //   NOTE: For folder its constent
    fileImg.src = `./assests/${file.icon}.png`;
    fileNameImgDiv.appendChild(fileImg);

    const fileName = document.createElement("p");
    fileName.classList.add("file-name-tag");
    fileName.append(document.createTextNode(file.fileName));
    fileNameImgDiv.appendChild(fileName); //* DO it in the last
    // ! This where the common element ends.

    return fileInfo;
  }

  deleteFolderOrFiles(el) {
    const name = el.querySelector(".file-name-tag");
    const confirmation = confirm(`DO you want to delete:-   ${name.innerText}`);

    if (confirmation) {
      const id = Number(el.id);
      this.db = this.db.filter((e) => e.id !== id && e.parentId !== id);
      this.render();
      this.setLocalStorage();
    }
  }

  createFolderElements(datas) {
    if (datas) {
      const fragment = document.createDocumentFragment();

      const outerDiv = document.createElement("div");
      outerDiv.classList.add("outer-div");

      for (let file of datas) {
        const folderContainer = document.createElement("div");
        folderContainer.setAttribute("id", file.id);
        folderContainer.classList.add("folder-container");

        outerDiv.appendChild(folderContainer);

        let arrowImgBtn;
        if (file.icon === "folder") {
          const arrowContainer = document.createElement("div");
          arrowContainer.classList.add("arrow-container");
          folderContainer.appendChild(arrowContainer);

          arrowImgBtn = document.createElement("img");
          arrowImgBtn.src = "./assests/right.png";
          arrowImgBtn.classList.add("arrow");

          arrowContainer.appendChild(arrowImgBtn);
        }

        const fileInfo = this.createFile(file);
        folderContainer.appendChild(fileInfo);
        this.addDraggable(folderContainer);

        folderContainer.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.deleteFolderOrFiles(folderContainer);
        });

        if (file.icon === "folder") {
          const addFolderContainer = document.createElement("div");
          addFolderContainer.classList.add("add-folders-container");
          folderContainer.appendChild(addFolderContainer);

          const addFileBtn = document.createElement("img");
          addFileBtn.classList.add("img-btn", "add-file-btn");
          addFileBtn.src = `./assests/add-file.png`;

          const nestedInput = document.createElement("input");
          nestedInput.classList.add("input");
          folderContainer.appendChild(nestedInput);

          let nestedFileType;

          addFileBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            nestedInput.style.display = "block";
            nestedInput.focus();
            nestedFileType = "file";
          });

          addFolderContainer.appendChild(addFileBtn);

          const addFolderBtn = document.createElement("img");
          addFolderBtn.classList.add("img-btn", "add-folder-btn");
          addFolderBtn.src = `./assests/add-folder.png`;

          addFolderBtn.addEventListener("click", (e) => {
            e.stopPropagation();

            nestedInput.style.display = "block";
            nestedInput.focus();
            nestedFileType = "folder";
          });

          nestedInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
              const value = nestedInput.value;

              if (value.trim()) {
                app.createFolderOrFileNode(value, file.id, nestedFileType);

                nestedInput.value = "";
                nestedInput.style.display = "none";
                nestedFileType = null;
              }
            } else if (e.key === "Escape") {
              nestedInput.value = "";
              nestedInput.style.display = "none";
              nestedFileType = null;
            }
          });

          addFolderContainer.appendChild(addFolderBtn);

          folderContainer.addEventListener("mouseenter", (e) => {
            addFolderContainer.style.display = "flex";
          });

          folderContainer.addEventListener("mouseleave", (e) => {
            addFolderContainer.style.display = "none";
          });

          folderContainer.addEventListener("click", (e) => {
            arrowImgBtn.classList.toggle("arrow-rotate");
            const children =
              arrowImgBtn.parentElement.parentElement.nextElementSibling;

            children.classList.toggle("hidden-child");
          });
        }

        const files = this.getFiles(file.id);
        if (files.length) {
          const subFiles = this.createFolderElements(files);
          outerDiv.appendChild(subFiles);
          this.addDragOver(folderContainer.nextElementSibling);
        }

        // if (subFiles) {
        //   console.log(subFiles.children[0]);
        //   const nestedInput = document.createElement("input");
        //   nestedInput.type = "text";
        //   nestedInput.classList.add("input");

        //   outerDiv.appendChild(nestedInput);
        // }
      }

      fragment.appendChild(outerDiv);
      return fragment;
    }
  }

  render() {
    this.root.innerHTML = "";
    const tree = this.createFolderElements(this.getRootDatas());
    this.root.appendChild(tree);
  }
}

const app = new App("root");

const sidebar = document.getElementById("sidebar");
const toggleButton = document.getElementById("toggle-button");
const mainContainer = document.getElementById("main-content");
const root = document.getElementById("root");

const addRootFile = document.getElementById("new-root-file");
const addRootFolder = document.getElementById("new-root-folder");
const rootBtn = document.querySelector(".root-btns");
const title = document.getElementById("title");
const rootInput = document.getElementById("root-input");

toggleButton.addEventListener("click", (e) => {
  sidebar.classList.toggle("sidebar");
  root.classList.toggle("root");
  rootBtn.classList.toggle("hide-root-btn");
  mainContainer.classList.toggle("main-content");
});

let type = null;

rootBtn.addEventListener("click", (e) => {
  if (e.target.id === "new-root-file") {
    type = "file";
  } else {
    type = "folder";
  }

  title.style.display = "none";
  rootInput.style.display = "block";
  rootInput.focus();
});

rootInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const value = rootInput.value;

    if (value.trim()) {
      app.createFolderOrFileNode(value, null, type);

      rootInput.value = "";
      title.style.display = "block";
      rootInput.style.display = "none";
      type = null;
    }
  } else if (e.key === "Escape") {
    rootInput.value = "";
    title.style.display = "block";
    rootInput.style.display = "none";
    type = null;
  }
});
