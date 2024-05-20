// import { Routes, Route } from "react-router-dom";
import AddFile from "./AddFile";
import AllFiles from "./AllFiles";

const Manage = () => {
  return (
    <div>
      <AllFiles />
      <hr />
      <AddFile />
    </div>
  );
};

export default Manage;
