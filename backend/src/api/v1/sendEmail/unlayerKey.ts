
import  dotenv  from "dotenv"
import  {Request,Response,Router} from "express";



dotenv.config();
const router = Router();

router.get(
    "/templates",
    async (req: Request , res: Response) =>{
        const api_key = process.env.UNLAYER_API_KEY;
        
        if (!api_key) {
            res.status(500).json({ error: "Missing Unlayer API key" })
        }

        const templateID = req.params.id
        const auth = Buffer.from(`${api_key}:`).toString('base64')

        try{
            const response: any = await fetch(
              `https://api.unlayer.com/v2/templates/${templateID}`,
              {
                headers:{
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/json"
                },
              }
            )

            if (!response.ok){
                res
                  .status(response.status)
                  .json({ error: "Failed to fetch template" })
                  return
            }

            const data = await response.json()
            res.json(data)
        }catch (error){
            console.error("Error fetching template:", error);
            res.status(500).json({error:"Failed to fetching template"})
            
        }
    }

    
)

export default router