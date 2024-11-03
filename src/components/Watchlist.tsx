import React, { useEffect, useState } from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import { Button, Container, Dialog, DialogActions, DialogTitle, ListItemButton, Typography } from '@mui/material';

import { DialogsProvider, useDialogs, DialogProps } from '@toolpad/core/useDialogs';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import AddIcon from '@mui/icons-material/Add';
import VirtualizedAutoComplete from './VirtualizedAutoComplete';

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
const client = generateClient<Schema>();

interface WatchlistProps {
    setToken: React.Dispatch<React.SetStateAction<string>>
}

export default function Watchlist({ setToken }: WatchlistProps) {
    const [tokenList, setTokenList] = useState<TokenInfo[]>([])
    const [watchlist, setWatchlist] = useState<Array<Schema["Watchlist"]["type"]>>([])

    useEffect(() => {
        getTokenList(setTokenList)
    }, [])

    useEffect(() => {
        client.models.Watchlist.observeQuery().subscribe({
            next: (data) => setWatchlist([...data.items]),
        });
    }, []);

    function MyDialog({ open, onClose }: DialogProps) {
        // ...
        const [selection, setSelection] = useState<TokenInfo | null>(null)

        return (
            <Dialog fullWidth open={open} onClose={() => onClose()} disablePortal={false}>
                <div className="add-to-watchlist-dialog">
                    <DialogTitle color="white">Select Token to Add to Watchlist</DialogTitle>
                    <Container>
                        <VirtualizedAutoComplete OPTIONS={tokenList} setSearch={setSelection} />
                    </Container>
                    <DialogActions>
                        <Button sx={{color:'white'}} onClick={() => onClose()}>Cancel</Button>
                        <Button sx={{color:'white'}} onClick={() => {
                            CreateWatchlistItem(selection)
                            onClose()
                        }}>Add</Button>
                    </DialogActions>
                </div>
            </Dialog>
        )
    }

    function SelectToken() {
        const dialogs = useDialogs()
        return (
            <>
                <IconButton
                    onClick={async () => {
                        const tokenId = await dialogs.open(MyDialog)
                        console.log(tokenId)
                    }}
                >
                    <AddIcon />
                </IconButton>
            </>
        )
    }

    function PromptDialog() {
        return (
            <DialogsProvider>
                <SelectToken />
            </DialogsProvider>
        )
    }

    function ChartToken(tokenId: string | undefined | null) {
        if (tokenId) {
            setToken(tokenId)
        }
    }

    return (
        <>
            <List sx={{ width: '100%', maxWidth: 360, padding: 1, borderTopLeftRadius: 4, backgroundColor: "#1A1A28" }}>
                <ListItem
                    disableGutters
                    secondaryAction={<PromptDialog />}//</List><IconButton onClick={AddTokenToWatchlist}><AddIcon/></IconButton>}
                >
                    <Typography sx={{ fontWeight: "bold", fontSize: 18, color: "white" }}>Watchlist</Typography>
                </ListItem>
                {watchlist.map((item) => {
                    return (
                        <ListItem
                            key={item.id}
                            disableGutters
                            disablePadding
                            secondaryAction={
                                <IconButton
                                    onClick={() => RemoveTokenFromWatchlist(item.id)}
                                    
                                >
                                    <DeleteForeverIcon />
                                </IconButton>
                            }
                        >
                            <ListItemButton onClick={() => { ChartToken(item.tokenId) }}>
                                <ListItemText sx={{ color: "white" }} primary={`${item.name}`}></ListItemText>
                            </ListItemButton>
                        </ListItem>
                    )
                })}
            </List>
        </>
    )
}

type TokenInfo = {
    id: string;
    name: string;
    symbol: string;
};


function RemoveTokenFromWatchlist(tokenId: string) {
    client.models.Watchlist.delete({ id: tokenId })
}

async function getTokenList(setTokenList: React.Dispatch<React.SetStateAction<TokenInfo[]>>) {
    try {
        const response = await fetch("http://localhost:3000/token/list")
        const data = await response.json()
        setTokenList(data)
    } catch (err) {
        console.error(err)
    }
}


function CreateWatchlistItem(tokenInfo: TokenInfo | null) {
    if (tokenInfo) {
        console.log("these are the models: " + JSON.stringify(client.models))
        client.models.Watchlist.create({ tokenId: tokenInfo?.id, symbol: tokenInfo?.symbol, name: tokenInfo?.name })
    }
}