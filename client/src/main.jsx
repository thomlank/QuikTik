import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/app.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css';
import router from './router.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router}/>
)
