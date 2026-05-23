import mongoose from "mongoose";

const mongoUri = process.env.MONGODB || process.env.MONGO_URI;
const mongoDbName = "smp";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  subscriptionPlan: String,
  subscriptionStatus: String,
  role: String
});

const subscriptionSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  clientEmail: { type: String, required: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  planType: { type: String, enum: ['subscription', 'one_time'], required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['active', 'cancelled', 'pending'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: Date
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);

async function assignLearningPlan() {
  if (!mongoUri) {
    console.error('MONGODB o MONGO_URI no está definido en las variables de entorno');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: mongoDbName });
    console.log('Conectado a MongoDB');

    const targetEmail = 'pcasmar0502@g.educaand.es';
  
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.error(`Usuario con email ${targetEmail} no encontrado`);
      process.exit(1);
    }

    console.log(`Usuario encontrado: ${user.name} (${user.email})`);

    const existingSub = await Subscription.findOne({ 
      clientId: user._id, 
      planId: 'learning', 
      status: 'active' 
    });

    if (existingSub) {
      console.log('El usuario ya tiene el plan Learning activo');
      console.log(`Suscripción ID: ${existingSub._id}`);
      process.exit(0);
    }

    const subscription = await Subscription.create({
      clientId: user._id,
      clientEmail: user.email,
      planId: 'learning',
      planName: 'Learning',
      planType: 'one_time',
      price: 60,
      status: 'active',
      startDate: new Date()
    });

    await User.findByIdAndUpdate(user._id, {
      subscriptionPlan: 'learning',
      subscriptionStatus: 'active',
      subscriptionStartDate: new Date()
    });

    console.log('✓ Plan Learning asignado correctamente');
    console.log(`  - Usuario: ${user.name} (${user.email})`);
    console.log(`  - Plan: Learning (pago único 60€)`);
    console.log(`  - Suscripción ID: ${subscription._id}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Conexión cerrada');
  }
}

assignLearningPlan();
