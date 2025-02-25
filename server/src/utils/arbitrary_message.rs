use serde::{de::DeserializeOwned, Deserialize};
use anyhow::anyhow;

#[derive(Deserialize)]
struct ArbitraryMessage {
    msgs: Vec<ArbitraryMessageItem>,
}

#[derive(Deserialize)]
struct ArbitraryMessageItem {
    value: ArbitraryMessageValue,
}

#[derive(Deserialize)]
struct ArbitraryMessageValue {
    data: String,
    signer: String,
}

pub fn to_arbitrary_message_bytes(signer: &str, data: &str) -> String {
    format!(
        "{{\"account_number\":\"0\",\"chain_id\":\"\",\"fee\":{{\"amount\":[],\"gas\":\"0\"}},\
        \"memo\":\"\",\"msgs\":[{{\"type\":\"sign/MsgSignData\",\"value\":{{\"data\":\"{}\",\
        \"signer\":\"{}\"}}}}],\"sequence\":\"0\"}}",
        data, signer
    )
}

pub fn from_arbitrary_message_bytes_to_data_structure<D: DeserializeOwned>(data_bytes: &[u8]) -> anyhow::Result<D> {
    let data = match serde_json::from_slice::<ArbitraryMessage>(data_bytes) {
        Ok(amino_message) => amino_message.msgs[0].value.data.clone(),
        Err(e) => return Err(anyhow!("Failed to parse arbitrary message: {}", e)),
    };

    let decoded = base64::decode(data)?;
    let json_str = String::from_utf8(decoded)?;
    Ok(serde_json::from_str::<D>(&json_str)?)
}