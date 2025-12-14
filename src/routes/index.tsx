import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "../pages/Login";
import BatchView from "../pages/Batch";
import BatchCreate from "../pages/BatchCreate";
import BatchEdit from "../pages/BatchEdit";
import OldCreate from "../pages/OldCreate";
import OldEdit from "../pages/OldEdit";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/batchList" element={<BatchView />} />
                <Route path="/batchCreate" element={<BatchCreate />} />
                <Route path="/OldCreate" element={<OldCreate />} />
                <Route path="/batchEdit/:id" element={<BatchEdit />} />
                <Route path="/OldEdit/:id" element={<OldEdit />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;