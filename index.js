const express = require('express')
const app = express()
const PORT = 8080
require('dotenv').config()
const supabase = require('@supabase/supabase-js').createClient(process.env.API_URL, process.env.API_KEY)

app.use(express.json())

app.get('/levels/:id', async (req, res) => {
    const { id } = req.params
    const d = {
        data:{},
        records:[]
    }
    var { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('id', id)
    if(data.length == 0){
        res.status(410).send({
            message: 'Level does not exists'
        })
        return
    }
    d.data = data[0]
    var { data, error } = await supabase
        .from('records')
        .select('*, players(name)')
        .eq('levelid', id)
        .order('progress', {ascending: false})
        .order('timestamp', {ascending: true})
    d.records = data
    res.status(200).send(d)
})

app.get('/levels/DL/page/:id', async (req, res) => {
    const { id } = req.params
    var { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('dlTop', { ascending: true })
        .range((id - 1) * 200, id * 200 - 1)
        .not("dlTop", 'is', null)
    res.status(200).send(data)
})

app.get('/levels/FL/page/:id', async (req, res) => {
    const { id } = req.params
    var { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('flTop', { ascending: true })
        .range((id - 1) * 200, id * 200 - 1)
        .not("flTop", 'is', null)
    res.status(200).send(data)
})

app.get('/players/:id', async (req, res) =>{
    const { id } = req.params
    var { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('uid', id)
    if(!data){
        res.status(410).send({
            message: 'Player does not exists'
        })
        return
    }
    res.status(200).send(data)
})

app.get('/players/:id/submissions', async (req, res) => {
    const { id } = req.params
    var { data, error } = await supabase
        .from('submissions')
        .select('*, levels(name)')
        .eq('userid', id)
        .order("id", {ascending: false})
    res.status(200).send(data)
})
app.get('/players/:id/records/:order', async (req, res) => {
    const { id, order } = req.params
    var { data, error } = await supabase
        .from('records')
        .select('*, levels(name)')
        .eq('userid', id)
        .order(order, {ascending: false})
    res.status(200).send(data)
})
app.get('/players/DL/page/:id', async (req, res) => {
    const { id } = req.params
    const { data, error } = await supabase
        .from('players')
        .select('uid, name, avatar, email, totalFLpt, totalDLpt, flrank, dlrank')
        .order('dlrank', {ascending: true})
        .range((id - 1) * 200, id * 200 - 1)
        .not("dlrank", 'is', null)
    res.status(200).send(data)
})

app.get('/players/FL/page/:id', async (req, res) => {
    const { id } = req.params
    const { data, error } = await supabase
        .from('players')
        .select('uid, name, avatar, email, totalFLpt, totalDLpt, flrank, dlrank')
        .order('flrank', {ascending: true})
        .range((id - 1) * 200, id * 200 - 1)
        .not("flrank", 'is', null)
    res.status(200).send(data)
})

app.get('/search/:id', async (req, res) => {
    var { id } = req.params
    if (isNaN(id)) {
        var m = {}
        var { data, error } = await supabase
            .from('levels')
            .select('*')
            .textSearch('name', `'${id}'`, {
                type: 'websearch',
                config: 'english'
            })
        for (var i = 0; i < data.length; i++) {
            m[data[i].id] = data[i]
        }
        var { data, error } = await supabase
            .from('players')
            .select('name, uid')
            .textSearch('name', `'${id}'`, {
                type: 'websearch',
                config: 'english'
            })
        var players = []
        for (var i = 0; i < data.length; i++) {
            players.push({
                id: data[i].uid,
                name: data[i].name
            })
        }
        var list = []
        for(const i in m){
            list.push(m[i])
        }
        res.status(200).send([list, players])
    }
    else {
        var { data, error } = await supabase
            .from('levels')
            .select('*')
            .eq('id', id)
        res.status(200).send(data)
    }
})

app.listen(
    PORT,
    () => {
        console.log(`Local development server running on http://localhost:${PORT}`)
    }
)