import AuthLogin from "../components/auth/Auth.Login";
import {Container,Row,Col} from "react-bootstrap"
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";
import { useLocation,useNavigate } from "react-router-dom"


export const Login = () => {
    const {auth} = useAuth()
    const { state } = useLocation()
    const navigate = useNavigate()

    useEffect(()=>{
        if(auth.isLoggedIn){
            navigate(state.source || "/home")
        }
    },[auth.isLoggedIn])


    return (
        <Container fluid>
            <Row>
                <Col xs={4}/>
                <Col>
                    <AuthLogin/>
                </Col>
                <Col xs={4}/>
            </Row>
        </Container>
    )
}
