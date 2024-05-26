import { useAuth } from "../hooks/useAuth";




const Layout = () => {

  useAuth({middleware:'auth',url:''});

  return (
    <div>Layout</div>
  )
}

export default Layout