import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "../pages/Login";
import BatchView from "../pages/Batch";
import BatchCreate from "../pages/BatchCreate";

const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/batchList" element={<BatchView />} />
                <Route path="/batchCreate" element={<BatchCreate />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;