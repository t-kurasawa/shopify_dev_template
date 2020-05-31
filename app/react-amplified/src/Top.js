import React from 'react';
import { 
  Button,
  Container, 
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper
} from '@material-ui/core';
import { Heading } from '@shopify/polaris'
import { makeStyles } from '@material-ui/core/styles';
import { parse } from 'query-string';
import axiosBase from 'axios';
import cognitoBase from './Cognito/cognito.js'
const cognito = new cognitoBase()

class Top extends React.Component{
  
  createData(title, vendor, body_html, tags, id) {
    return { title, vendor, body_html, tags, id };
  }

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      title:'',
      vendor:'',
      body_html:'',
      tags:'',
      jwtToken: '',
      shopOrigin: ''
    };
  }

  async getProducts(){
    const axios = axiosBase.create({
      baseURL: process.env.REACT_APP_PRIVATE_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.jwtToken
      },
      responseType: 'json'
    })
    const response = await axios.get(`/products?shop=${this.state.shopOrigin}`).catch(error=>{
      console.log(error)
    })
    return response?.data
  }

  createProduct = async () =>{
    const axios = axiosBase.create({
      baseURL: process.env.REACT_APP_PRIVATE_API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.jwtToken
      },
      responseType: 'json'
    })
    const response = await axios.post(`/products?shop=${this.state.shopOrigin}`,{
      title: this.state.title,
      vendor:this.state.vendor,
      body_html:this.state.body_html,
      tags:this.state.tags
    }).catch(error=>{
      console.log(error)
    })
    const item = response.data.product
    let items = this.state.items
    items.push(
      this.createData(
        item.title,
        item.vendor,
        item.body_html,
        item.tags,
        item.id,
      )
    )
    this.setState({items:items})
    return response.data
  }

  async componentDidMount() {
    // TODO: ログイン画面の作成（signup -> confirmation -> login を一旦代替）
    // const res = await cognito.signUp('your-email@mail.com', 'P@ssw0rd1234567890')
    // const res = await cognito.confirmation('your-email@mail.com',"123456")
    const res = await cognito.login('your-email@mail.com', 'P@ssw0rd1234567890')
    /**
     *  Step 4: Making authenticated requests
     *  4-1. 永続化した access_token,scope を取得
     */
    const query = parse(this.props.location.search);
    const shopOrigin = query.shop;
    this.setState({
      shopOrigin: shopOrigin,
      jwtToken:res.idToken.jwtToken,
    })
    const data = await this.getProducts(shopOrigin)
    let items = []
    data.products.forEach(item => {
      items.push(
        this.createData(
          item.title,
          item.vendor,
          item.body_html,
          item.tags,
          item.id,
        )
      )
    });
    this.setState({ 
      items:items
    })
  }

  render(){

    const classes = makeStyles((theme)=> ({
      table: {
        minWidth: 650,
      },
      root: {
        '& .MuiTextField-root': {
          margin: theme.spacing(1),
          width: '25ch',
        },
      }
    }));

    const handleChangeTitle = (event) => {
      this.setState({title:event.target.value})
    };

    const handleChangeVendor = (event) => {
      this.setState({vendor:event.target.value})
    };

    const handleChangeBodyHtml = (event) => {
      this.setState({body_html:event.target.value})
    };

    const handleChangeTags = (event) => {
      this.setState({tags:event.target.value})
    };
  
    return (
      <Container fixed>
        <Heading>Shopify app with ReactAmplified and Serverless</Heading>
        <form className={classes.root}>
          <div>
            <TextField id="title" label="商品名" onChange={handleChangeTitle} />
            <TextField id="vendor" label="テナント名" onChange={handleChangeVendor} />
            <TextField id="body_html" label="商品説明" onChange={handleChangeBodyHtml} />
            <TextField id="tags" label="タグ" onChange={handleChangeTags} />
            <Button onClick={this.createProduct} variant="contained" color="primary">商品登録</Button>
          </div>
        </form>
        <Divider />
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell align="right">vendor</TableCell>
                <TableCell align="right">body_html</TableCell>
                <TableCell align="right">tags</TableCell>
                <TableCell align="right">id</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.items.map((row) => (
                <TableRow key={row.name}>
                  <TableCell component="th" scope="row">{row.title}</TableCell>
                  <TableCell align="right">{row.vendor}</TableCell>
                  <TableCell align="right">{row.body_html}</TableCell>
                  <TableCell align="right">{row.tags}</TableCell>
                  <TableCell align="right">{row.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }
}

export default Top;
