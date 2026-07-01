import React, { useEffect, useState } from "react";
import Validate from "./Validate";

const WorkFlow = (props) => {
    let [func, setFunc] = useState("add");
    let [stepsData, setStepsData] = useState([{ stepTitle: "title one", newStepPrice: "3 days", tasks: ["gather info:not-complete", "list goals:complete"] }]);
    let [confirm, setConfirm] = useState("");
    let [onDeckDelete, setOnDeckDelete] = useState("");


    const createStep = () => {
        Validate(["newStepTitle", "newStepPrice"]);

        if (document.querySelector(".error")) {
            return false;
        }

        let tempSteps = [...stepsData, { stepTitle: document.querySelector("[name='newStepTitle']").value, newStepPrice: document.querySelector("[name='newStepPrice']").value, tasks: [] }];

        setStepsData((stepsData) => tempSteps);
        props.showAlert(document.querySelector("[name='newStepTitle']").value + " added.", "success");
        document.querySelector("[name='newStepTitle']").value = "";
        document.querySelector("[name='newStepPrice']").value = "";

        console.log("JSON.stringify(tempSteps): " + JSON.stringify(tempSteps));

    }

    const selectForDelete = () => {
        let tempDelete = document.querySelector("select[name='selectDelete']").value;
        if (tempDelete === "default") {
            return false;
        }
        setConfirm((confirm) => "deleteStep");
        setOnDeckDelete((onDeckDelete) => tempDelete);

    }

    const deleteStep = () => {
        let tempDelete = [];
        for (let i = 0; i < stepsData.length; i++) {
            if (stepsData[i].stepTitle !== onDeckDelete) {
                tempDelete.push(stepsData[i]);
            }
        }

        setStepsData((stepsData) => tempDelete);
        setConfirm((confirm) => "");

    }


    return (

        <React.Fragment>
            <div className="row">
                <div className="col-md-12">
                    <div className="btn-group block">
                        <button className={func === "add" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setFunc((func) => "add")}>New Step</button>
                        <button className={func === "delete" ? "btn btn-primary active" : "btn btn-primary"} onClick={() => setFunc((func) => "delete")}>Delete Step</button>
                    </div>
                </div>



                {func === "add" ?

                    <div className="col-md-12">
                        <input type="text" name="newStepTitle" className="form-control" placeholder="Step Name" />
                        <input type="text" name="newStepPrice" className="form-control" placeholder="Total time or dollar amount" />
                        <button className="btn btn-primary w-100" onClick={() => createStep()}>Submit</button>
                    </div>
                    : <div className="col-md-12">
                        <select className="form-control" onChange={() => selectForDelete()} name="selectDelete">
                            <option value="default">Select step to delete</option>
                            {stepsData ? stepsData.map((step, i) => {
                                return <option key={i} value={step.stepTitle}>{step.stepTitle}</option>
                            }) : null}
                        </select>
                    </div>}

                {confirm === "deleteStep" ?
                    <div className="col-md-12 alert alert-warning">
                        <p>Are you sure you want to delete {onDeckDelete}</p>
                        <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                        <button className="btn btn-warning" onClick={() => deleteStep()}>Yes</button>
                    </div>
                    : null}
            </div>





        </React.Fragment>)



}

export default WorkFlow;