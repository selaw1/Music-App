import React, {Component} from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {Link} from "react-router-dom";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert"


export default class CreateRoomPage extends Component{
    static defaultProps = {
        votesToSkip: 1,
        guestCanPause: true,
        update:false,
        roomCode: null,
        updateCallback: () => {}
    }

    constructor(props){
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            errorMsg:"",
            successMsg:""
        };
    }

    getCookie = name => {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    handleVotesChange = e => {
        this.setState({
            votesToSkip: +(e.target.value),
        });
    }

    handleGuestCanPauseChange = e => {
        this.setState({
            guestCanPause: e.target.value === "true" ? true:false,
        });
    }

    
    handlerUpdateButton = () => {
        const csrfToken = this.getCookie('csrftoken')

        const requestOptions = {
            method:"PATCH",
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken':csrfToken,
            },
            body:JSON.stringify({
                votes_to_skip:this.state.votesToSkip,
                guest_can_pause:this.state.guestCanPause,
                code:this.props.roomCode
            }),
        };
        fetch("/api/room/update/", requestOptions)
        .then(response => {
            if (response.ok) {
                this.setState({
                    successMsg:"Room Updated Successfully!"
                });
            }else {
                this.setState({
                    errorMsg:"Error Updating Room..."
                })
            }
            this.props.updateCallback()
        });
    }

    handlerCreateButton = () => {
        const csrfToken = this.getCookie('csrftoken')

        const requestOptions = {
            method:"POST",
            headers:{
                'Content-Type':'application/json',
                'X-CSRFToken':csrfToken,
            },
            body:JSON.stringify({
                votes_to_skip:this.state.votesToSkip,
                guest_can_pause:this.state.guestCanPause
            }),
        };
        fetch("/api/room/create/", requestOptions)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            this.props.history.push(`/room/${data.code}/`)
        })
    }

    renderUpdateButtons = () => {
        return (
            <Grid item xs={12} align="center">
                <Button color="primary" variant="contained" onClick={this.handlerUpdateButton}>Update Room</Button>
            </Grid>
        );   
    }

    renderCreateButtons = () => {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Button color="primary" variant="contained" onClick={this.handlerCreateButton}>Create Room</Button>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button color="secondary" variant="contained" to="/" component={Link}>Home</Button>
                </Grid>
            </Grid>
        );
    }

    render(){
        const title = this.props.update ? "Update Room":"Create Room"
        console.log(this.props.guestCanPause.toString())
        console.log(this.props.votesToSkip)
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center"> 
                    <Collapse in={this.state.errorMsg != "" || this.state.successMsg != ""}>
                        {this.state.successMsg != "" ? (<Alert severity="success" onClose={() => {this.setState({successMsg:""})}}>{this.state.successMsg}</Alert>):(<Alert onClose={() => {this.setState({errorMsg:""})}} severity="error">{this.state.successMsg}</Alert>)}
                    </Collapse>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography component="h4" variant="h4">{title}</Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl component="fieldset">
                        <FormHelperText>
                            <div align="center">Guest Control of Playback State</div>
                        </FormHelperText>
                        <RadioGroup row defaultValue={this.props.guestCanPause.toString()} onChange={this.handleGuestCanPauseChange}>
                            <FormControlLabel 
                                value="true" 
                                control={<Radio color="primary"/>}
                                label="Play/Pause"
                                labelPlacement="bottom"    
                            />
                            <FormControlLabel 
                                value="false" 
                                control={<Radio color="secondary"/>}
                                label="No Control"
                                labelPlacement="bottom"    
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item xs={12} align="center">
                    <FormControl>
                        <TextField required={true} type="number" defaultValue={this.props.votesToSkip} inputProps={{min:1, style:{textAlign:"center"}}} onChange={this.handleVotesChange}/>
                        <FormHelperText>
                            <div align="center">
                                Votes Required To Skip Song
                            </div>
                        </FormHelperText>
                    </FormControl>
                </Grid>
                {this.props.update ? this.renderUpdateButtons():this.renderCreateButtons()}
            </Grid>
        )
    };
}